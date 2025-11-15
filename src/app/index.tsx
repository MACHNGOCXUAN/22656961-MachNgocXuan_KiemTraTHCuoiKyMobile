import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Expense } from "@/types";
import { getAllExpenses } from "@/database/db";
import { ExpenseItem } from "@/components/ExpenseItem";

export default function ExpensesListScreen() {
  const db = useSQLiteContext();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchExpenses();
  }, [db]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (expenses.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500 text-lg">Chưa có khoản chi tiêu nào.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={expenses}
      keyExtractor={(item) => item.id!.toString()}
      renderItem={({ item }) => <ExpenseItem item={item} />}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
