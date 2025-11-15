import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { AntDesign } from "@expo/vector-icons"; // icon +
import { Expense } from "@/types";
import {
  createExpense,
  deleteExpense,
  getAllExpenses,
  updateExpense,
} from "@/database/db";
import { ExpenseItem } from "@/components/ExpenseItem";

export default function ExpensesListScreen() {
  const db = useSQLiteContext();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Expense | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, [db]);

  const fetchExpenses = async () => {
    try {
      const data = await getAllExpenses(db);
      setExpenses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!title.trim()) {
      Alert.alert("Lỗi", "Title không được để trống");
      return;
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Lỗi", "Amount phải là số lớn hơn 0");
      return;
    }

    try {
      await createExpense(db, {
        title: title.trim(),
        amount: parsedAmount,
        category: category.trim() || undefined,
      });

      await fetchExpenses();

      setTitle("");
      setAmount("");
      setCategory("");
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể thêm khoản chi tiêu");
    }
  };

  const handleEditItem = (item: Expense) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditAmount(item.amount.toString());
    setEditCategory(item.category ?? "");
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      Alert.alert("Lỗi", "Title không được để trống");
      return;
    }

    const parsedAmount = Number(editAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Lỗi", "Amount phải là số lớn hơn 0");
      return;
    }

    if (!editingItem) return;

    try {
      await updateExpense(db, {
        ...editingItem,
        title: editTitle.trim(),
        amount: parsedAmount,
        category: editCategory.trim() || undefined,
      });
      await fetchExpenses();
      setEditModalVisible(false);
      setEditingItem(null);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể cập nhật khoản chi tiêu");
    }
  };

  const handleDeleteItem = (item: Expense) => {
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn xóa khoản chi tiêu "${item.title}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(db, item.id!);
              await fetchExpenses();
            } catch (error) {
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleTogglePaid = async (item: Expense) => {
    try {
      await updateExpense(db, { ...item, paid: item.paid ? 0 : 1 });
      await fetchExpenses();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {expenses.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">
            Chưa có khoản chi tiêu nào.
          </Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={({ item }) => (
            <ExpenseItem
              item={item}
              onTogglePaid={handleTogglePaid}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-10 right-5 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow"
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center bg-black/40 px-4">
          <View className="bg-white p-6 rounded-lg">
            <Text className="text-lg font-bold mb-4">
              Chỉnh sửa khoản chi tiêu
            </Text>

            <TextInput
              placeholder="Title"
              value={editTitle}
              onChangeText={setEditTitle}
              className="border border-gray-300 rounded px-3 py-2 mb-3"
            />
            <TextInput
              placeholder="Amount"
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="numeric"
              className="border border-gray-300 rounded px-3 py-2 mb-3"
            />
            <TextInput
              placeholder="Category"
              value={editCategory}
              onChangeText={setEditCategory}
              className="border border-gray-300 rounded px-3 py-2 mb-3"
            />

            <View className="flex-row justify-end gap-3 mt-4">
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 rounded"
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
