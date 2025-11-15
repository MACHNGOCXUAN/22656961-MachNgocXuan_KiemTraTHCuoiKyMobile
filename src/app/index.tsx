import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import { ExpenseItem } from "../components/ExpenseItem";
import { Expense } from "@/types";
import { useExpenses } from "@/hooks/useExpenses";

export default function ExpensesListScreen() {
  const db = useSQLiteContext();
  const {
    expenses,
    loading,
    error,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    totalAmount,
    fetchExpenses,
    addExpense,
    editExpense,
    removeExpense,
    togglePaid,
    importFromAPI,
  } = useExpenses(db);

  /** Modal thêm/sửa chi tiêu */
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<Expense | null>(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const openAddModal = () => {
    setEditItem(null);
    setTitle(""); setAmount(""); setCategory(""); setModalVisible(true);
  };

  const openEditModal = (item: Expense) => {
    setEditItem(item);
    setTitle(item.title);
    setAmount(item.amount.toString());
    setCategory(item.category ?? "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    const parsedAmount = Number(amount);
    if (!title.trim()) { Alert.alert("Lỗi", "Title không được để trống"); return; }
    if (isNaN(parsedAmount) || parsedAmount <= 0) { Alert.alert("Lỗi", "Amount phải > 0"); return; }

    try {
      if (editItem) {
        await editExpense({ ...editItem, title: title.trim(), amount: parsedAmount, category: category.trim() });
      } else {
        await addExpense({ title: title.trim(), amount: parsedAmount, category: category.trim() });
      }
      setModalVisible(false);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể lưu chi tiêu");
    }
  };

  const handleDelete = (item: Expense) => {
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn xóa "${item.title}"?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => removeExpense(item.id!) }
      ]
    );
  };

  if (loading) return (
    <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search + Filter */}
      <View className="px-4 py-2 bg-gray-100">
        <TextInput
          placeholder="Tìm kiếm theo title..."
          value={search}
          onChangeText={setSearch}
          className="border border-gray-300 rounded px-3 py-2 mb-2 bg-white"
        />
        <TextInput
          placeholder="Filter category..."
          value={categoryFilter}
          onChangeText={setCategoryFilter}
          className="border border-gray-300 rounded px-3 py-2 bg-white"
        />
      </View>

      {/* Buttons */}
      <View className="flex-row px-4 py-2 justify-between items-center">
        <TouchableOpacity
          onPress={openAddModal}
          disabled={loading}
          className={`px-4 py-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
        >
          <Text className="text-white font-bold">+ Thêm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => importFromAPI("https://mockapi.io/expenses")}
          disabled={loading}
          className={`px-4 py-2 rounded ${loading ? 'bg-gray-400' : 'bg-green-600'}`}
        >
          <Text className="text-white font-bold">Import API</Text>
        </TouchableOpacity>
      </View>

      {error && <Text className="text-red-500 px-4">{error}</Text>}

      {/* FlatList */}
      {expenses.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <AntDesign name="frown" size={64} color="gray" />
          <Text className="text-gray-500 text-lg mt-4">Chưa có khoản chi tiêu nào.</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={({ item }) => (
            <ExpenseItem
              item={item}
              onTogglePaid={togglePaid}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          )}
          refreshing={loading}
          onRefresh={fetchExpenses}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Tổng tiền */}
      <View className="px-4 py-2 border-t border-gray-300 bg-gray-100">
        <Text className="text-lg font-bold">Tổng chi tiêu: {totalAmount.toLocaleString()}đ</Text>
      </View>

      {/* Modal thêm/sửa */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center bg-black/40 px-4">
          <View className="bg-white p-6 rounded-lg">
            <Text className="text-lg font-bold mb-4">{editItem ? "Chỉnh sửa" : "Thêm"} khoản chi tiêu</Text>
            <TextInput placeholder="Title" value={title} onChangeText={setTitle} className="border border-gray-300 rounded px-3 py-2 mb-3"/>
            <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" className="border border-gray-300 rounded px-3 py-2 mb-3"/>
            <TextInput placeholder="Category" value={category} onChangeText={setCategory} className="border border-gray-300 rounded px-3 py-2 mb-3"/>
            <View className="flex-row justify-end gap-3 mt-4">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-2 bg-gray-300 rounded"><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} className="px-4 py-2 bg-blue-600 rounded"><Text className="text-white">Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
