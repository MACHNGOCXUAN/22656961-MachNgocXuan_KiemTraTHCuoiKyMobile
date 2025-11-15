import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Expense } from "@/types";

type Props = {
  item: Expense;
  onTogglePaid: (item: Expense) => void;
  onEdit: (item: Expense) => void;
  onDelete: (item: Expense) => void;
};

export const ExpenseItem: React.FC<Props> = ({
  item,
  onTogglePaid,
  onEdit,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onTogglePaid(item)}
      className="flex-row justify-between items-center bg-white rounded-lg p-4 my-2 mx-4 shadow"
    >
      <View className="flex-1">
        <Text className="font-bold text-lg mb-1">{item.title}</Text>
        <Text className="text-gray-500">{item.category}</Text>
      </View>

      <View className="flex-row items-center gap-3">
        {/* Số tiền và trạng thái */}
        <View className="items-end">
          <Text className="font-bold text-lg mb-1">
            {item.amount.toLocaleString()}đ
          </Text>
          <Text
            className={`text-sm font-medium ${
              item.paid ? "text-green-600" : "text-red-600"
            }`}
          >
            {item.paid ? "Đã thanh toán" : "Chưa thanh toán"}
          </Text>
        </View>

        {/* Nút Edit */}
        <TouchableOpacity onPress={() => onEdit(item)} className="ml-3">
          <AntDesign name="edit" size={20} color="#1E40AF" />
        </TouchableOpacity>

        {/* Nút Delete */}
        <TouchableOpacity onPress={() => onDelete(item)} className="ml-3">
          <AntDesign name="delete" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};