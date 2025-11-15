import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Expense } from "@/types";

type Props = {
  item: Expense;
  onTogglePaid: (item: Expense) => void;
};

export const ExpenseItem: React.FC<Props> = ({ item, onTogglePaid }) => {
  return (
    <TouchableOpacity
      onPress={() => onTogglePaid(item)}
      className="flex-row justify-between items-center bg-white rounded-lg p-4 my-2 mx-4 shadow"
    >
      {/* Thông tin chi tiêu */}
      <View className="flex-1">
        <Text className="font-bold text-lg mb-1">{item.title}</Text>
        <Text className="text-gray-500">{item.category}</Text>
      </View>

      {/* Số tiền và trạng thái */}
      <View className="items-end">
        <Text className="font-bold text-lg mb-1">
          {item.amount.toLocaleString()}đ
        </Text>
        <View className="flex-row items-center gap-1">
          <AntDesign
            name={item.paid ? "check-circle" : "close-circle"}
            size={16}
            color={item.paid ? "green" : "red"}
          />
          <Text
            className={`text-sm font-medium ${
              item.paid ? "text-green-600" : "text-red-600"
            }`}
          >
            {item.paid ? "Đã thanh toán" : "Chưa thanh toán"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
