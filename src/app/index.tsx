import React, { useState, useEffect, useMemo } from "react";
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
import { useSQLiteContext } from "expo-sqlite";
import { AntDesign } from "@expo/vector-icons";
import { getAllExpenses, createExpense, updateExpense, deleteExpense } from "../database/db";
import { Expense } from "@/types";
import { ExpenseItem } from "@/components/ExpenseItem";

export default function ExpensesListScreen() {
  const db = useSQLiteContext();

  /** State danh sách */
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  /** State modal thêm */
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  /** State modal edit */
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Expense | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");

  /** State search/filter */
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  /** State import API */
  const [loadingAPI, setLoadingAPI] = useState(false);
  const [errorAPI, setErrorAPI] = useState<string | null>(null);

  /** Fetch danh sách chi tiêu */
  const fetchExpenses = async () => {
    try {
      const data = await getAllExpenses(db);
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  /** Thêm chi tiêu */
  const handleAddExpense = async () => {
    if (!title.trim()) {
      Alert.alert("Lỗi", "Title không được để trống");
      return;
    }
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Lỗi", "Amount phải là số > 0");
      return;
    }

    try {
      await createExpense(db, {
        title: title.trim(),
        amount: parsedAmount,
        category: category.trim() || undefined,
      });
      await fetchExpenses();
      setTitle(""); setAmount(""); setCategory(""); setModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể thêm chi tiêu");
    }
  };

  /** Chỉnh sửa chi tiêu */
  const handleEditItem = (item: Expense) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditAmount(item.amount.toString());
    setEditCategory(item.category ?? "");
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (!editTitle.trim()) {
      Alert.alert("Lỗi", "Title không được để trống");
      return;
    }
    const parsedAmount = Number(editAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Lỗi", "Amount phải là số > 0");
      return;
    }

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
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể cập nhật chi tiêu");
    }
  };

  /** Toggle paid */
  const handleTogglePaid = async (item: Expense) => {
    try {
      await updateExpense(db, { ...item, paid: item.paid ? 0 : 1 });
      await fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  /** Xóa chi tiêu */
  const handleDeleteItem = (item: Expense) => {
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn xóa "${item.title}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(db, item.id!);
              await fetchExpenses();
            } catch (err) { console.error(err); }
          },
        },
      ]
    );
  };

  /** Filter danh sách */
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter
        ? item.category?.toLowerCase() === categoryFilter.toLowerCase()
        : true;
      return matchTitle && matchCategory;
    });
  }, [expenses, search, categoryFilter]);

  /** Import từ API */
  const importFromAPI = async () => {
    setLoadingAPI(true);
    setErrorAPI(null);
    try {
      const res = await fetch("https://67c83c700acf98d0708588de.mockapi.io/api/v1/todos");
      if (!res.ok) throw new Error("Failed to fetch API");
      const data: any[] = await res.json();

      const existing = await getAllExpenses(db);
      for (const item of data) {
        const title = item.title;
        const amount = Number(item.price ?? item.amount ?? 0);
        const category = item.category;

        const isExist = existing.some((e) => e.title === title && e.amount === amount);
        if (isExist) continue;

        await createExpense(db, { title, amount, category });
      }
      await fetchExpenses();
    } catch (err: any) {
      console.error(err);
      setErrorAPI(err.message || "Lỗi khi import API");
    } finally {
      setLoadingAPI(false);
    }
  };

  if (loading) return (
    <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>
  );

  return (
    <View className="flex-1">
      {/* Search + filter */}
      <View className="px-4 py-2 bg-gray-100">
        <TextInput
          placeholder="Tìm kiếm theo title..."
          value={search}
          onChangeText={setSearch}
          className="border border-gray-300 rounded px-3 py-2 bg-white mb-2"
        />
        {/* Category filter */}
        <TextInput
          placeholder="Filter category (tùy chọn)"
          value={categoryFilter}
          onChangeText={setCategoryFilter}
          className="border border-gray-300 rounded px-3 py-2 bg-white"
        />
      </View>

      {/* Nút import API */}
      <TouchableOpacity
        onPress={importFromAPI}
        className="px-4 py-2 bg-green-600 rounded m-4 items-center"
      >
        <Text className="text-white font-bold">Import từ API</Text>
      </TouchableOpacity>
      {loadingAPI && <Text className="px-4 text-gray-500">Đang import...</Text>}
      {errorAPI && <Text className="px-4 text-red-500">{errorAPI}</Text>}

      {/* FlatList */}
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

      {/* Modal thêm chi tiêu */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center bg-black/40 px-4">
          <View className="bg-white p-6 rounded-lg">
            <Text className="text-lg font-bold mb-4">Thêm khoản chi tiêu</Text>
            <TextInput placeholder="Title" value={title} onChangeText={setTitle} className="border border-gray-300 rounded px-3 py-2 mb-3"/>
            <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" className="border border-gray-300 rounded px-3 py-2 mb-3"/>
            <TextInput placeholder="Category" value={category} onChangeText={setCategory} className="border border-gray-300 rounded px-3 py-2 mb-3"/>
            <View className="flex-row justify-end gap-3 mt-4">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-2 bg-gray-300 rounded"><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleAddExpense} className="px-4 py-2 bg-blue-600 rounded"><Text className="text-white">Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal edit chi tiêu */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center bg-black/40 px-4">
          <View className="bg-white p-6 rounded-lg">
            <Text className="text-lg font-bold mb-4">Chỉnh sửa khoản chi tiêu</Text>
            <TextInput placeholder="Title" value={editTitle} onChangeText={setEditTitle} className="border border-gray-300 rounded px-3 py-2 mb-3"/>
            <TextInput placeholder="Amount" value={editAmount} onChangeText={setEditAmount} keyboardType="numeric" className="border border-gray-300 rounded px-3 py-2 mb-3"/>
            <TextInput placeholder="Category" value={editCategory} onChangeText={setEditCategory} className="border border-gray-300 rounded px-3 py-2 mb-3"/>
            <View className="flex-row justify-end gap-3 mt-4">
              <TouchableOpacity onPress={() => setEditModalVisible(false)} className="px-4 py-2 bg-gray-300 rounded"><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSaveEdit} className="px-4 py-2 bg-blue-600 rounded"><Text className="text-white">Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Nút + thêm chi tiêu */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-10 right-5 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow"
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
