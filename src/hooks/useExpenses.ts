import { useState, useEffect, useCallback, useMemo } from "react";
import { SQLiteDatabase } from "expo-sqlite";
import { getAllExpenses, createExpense, updateExpense, deleteExpense } from "../database/db";

export type Expense = {
  id?: number;
  title: string;
  amount: number;
  category?: string;
  paid?: number;
};

export const useExpenses = (db: SQLiteDatabase) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  /** Load danh sách */
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllExpenses(db);
      setExpenses(data);
    } catch (err: any) {
      setError(err.message || "Lỗi khi load dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [db]);

  /** Thêm chi tiêu */
  const addExpense = useCallback(async (expense: Expense) => {
    await createExpense(db, expense);
    await fetchExpenses();
  }, [db, fetchExpenses]);

  /** Chỉnh sửa chi tiêu */
  const editExpense = useCallback(async (expense: Expense) => {
    await updateExpense(db, expense);
    await fetchExpenses();
  }, [db, fetchExpenses]);

  /** Xóa chi tiêu */
  const removeExpense = useCallback(async (id: number) => {
    await deleteExpense(db, id);
    await fetchExpenses();
  }, [db, fetchExpenses]);

  /** Toggle paid */
  const togglePaid = useCallback(async (item: Expense) => {
    await editExpense({ ...item, paid: item.paid ? 0 : 1 });
  }, [editExpense]);

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

  /** Tổng tiền */
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  /** Import từ API */
  const importFromAPI = useCallback(async (apiUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl);
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
      setError(err.message || "Lỗi khi import API");
    } finally {
      setLoading(false);
    }
  }, [db, fetchExpenses]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses: filteredExpenses,
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
  };
};
