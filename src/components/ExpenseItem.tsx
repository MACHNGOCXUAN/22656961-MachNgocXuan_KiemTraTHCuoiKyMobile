import { Expense } from "@/types";
import React from "react";
import { View, Text } from "react-native";

type Props = {
  item: Expense;
};

export const ExpenseItem: React.FC<Props> = ({ item }) => {
  return (
    <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
      <View>
        <Text className="font-bold text-lg">{item.title}</Text>
        <Text className="text-gray-500">{item.category}</Text>
      </View>
      <View className="items-end">
        <Text className="font-bold text-lg">{item.amount.toLocaleString()}đ</Text>
        <Text className={`text-sm ${item.paid ? "text-green-600" : "text-red-600"}`}>
          {item.paid ? "Đã thanh toán" : "Chưa thanh toán"}
        </Text>
      </View>
    </View>
  );
};
