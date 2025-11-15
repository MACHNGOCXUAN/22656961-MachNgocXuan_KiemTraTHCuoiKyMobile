import React, { useEffect, useMemo, useState } from "react";
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

  const [search, setSearch] = useState(""); // input search
  const [categoryFilter, setCategoryFilter] = useState(""); // filter theo category

  useEffect(() => {
    fetchExpenses();
  }, [db]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter
        ? item.category?.toLowerCase() === categoryFilter.toLowerCase()
        : true;
      return matchTitle && matchCategory;
    });
  }, [expenses, search, categoryFilter]);

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
      <View className="px-4 py-2 bg-gray-100">
        <TextInput
          placeholder="Tìm kiếm theo title..."
          value={search}
          onChangeText={setSearch}
          className="border border-gray-300 rounded px-3 py-2 bg-white"
        />
      </View>

      {filteredExpenses.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">Chưa có khoản chi tiêu nào.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredExpenses}
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
    </View>
  );
}
