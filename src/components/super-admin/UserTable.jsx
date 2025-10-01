// src/components/super-admin/UserTable.jsx
"use client";
import { motion } from "framer-motion";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function UserTable({ users, onEdit, onDelete, loading }) {
  const columns = [
    {
      key: "name",
      label: "Nama",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">
              {row.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-neutral-text">{row.name}</div>
            <div className="text-sm text-neutral-secondary">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <Badge variant={row.role === "guru" ? "primary" : "info"}>
          {row.role === "guru" ? "Guru" : "Siswa"}
        </Badge>
      ),
    },
    { key: "identifier", label: "NIP/NISN" },
    {
      key: "kelas",
      label: "Kelas",
      render: (row) => row.kelas?.nama || "-",
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "danger"} dot>
          {row.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Aksi",
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(row)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(row)}
            className="text-danger"
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={users} loading={loading} />;
}
