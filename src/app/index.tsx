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
import { createExpense, getAllExpenses, updateExpense } from "@/database/db";
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
    // Validate
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

      // Cập nhật danh sách
      await fetchExpenses();

      // Reset form
      setTitle("");
      setAmount("");
      setCategory("");
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể thêm khoản chi tiêu");
    }
  };

  const handleTogglePaid = async (item: Expense) => {
    try {
      await updateExpense(db, { ...item, paid: item.paid ? 0 : 1 });
      // Cập nhật lại danh sách sau khi toggle
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
      {/* FlatList hiển thị danh sách */}
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
            <ExpenseItem item={item} onTogglePaid={handleTogglePaid} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Nút + */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-10 right-5 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow"
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal thêm chi tiêu */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center bg-black/40 px-4">
          <View className="bg-white p-6 rounded-lg">
            <Text className="text-lg font-bold mb-4">Thêm khoản chi tiêu</Text>

            <TextInput
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              className="border border-gray-300 rounded px-3 py-2 mb-3"
            />
            <TextInput
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              className="border border-gray-300 rounded px-3 py-2 mb-3"
            />
            <TextInput
              placeholder="Category"
              value={category}
              onChangeText={setCategory}
              className="border border-gray-300 rounded px-3 py-2 mb-3"
            />

            <View className="flex-row justify-end gap-3 mt-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddExpense}
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
