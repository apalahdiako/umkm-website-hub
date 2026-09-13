export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          aksi: string
          created_at: string
          entitas: string
          entitas_id: string | null
          id: string
          operator_id: string | null
          sebelum: Json | null
          sesudah: Json | null
          shift_id: string | null
          user_id: string | null
        }
        Insert: {
          aksi: string
          created_at?: string
          entitas: string
          entitas_id?: string | null
          id?: string
          operator_id?: string | null
          sebelum?: Json | null
          sesudah?: Json | null
          shift_id?: string | null
          user_id?: string | null
        }
        Update: {
          aksi?: string
          created_at?: string
          entitas?: string
          entitas_id?: string | null
          id?: string
          operator_id?: string | null
          sebelum?: Json | null
          sesudah?: Json | null
          shift_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          nama: string
          station: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          nama: string
          station?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          nama?: string
          station?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nama: string
          phone: string | null
          poin: number
          tier: string
          total_belanja: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nama: string
          phone?: string | null
          poin?: number
          tier?: string
          total_belanja?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nama?: string
          phone?: string | null
          poin?: number
          tier?: string
          total_belanja?: number
          updated_at?: string
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          created_at: string
          harga_beli: number
          id: string
          nama: string
          outlet_id: string | null
          satuan: string
          stok: number
          stok_minimum: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          harga_beli?: number
          id?: string
          nama: string
          outlet_id?: string | null
          satuan?: string
          stok?: number
          stok_minimum?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          harga_beli?: number
          id?: string
          nama?: string
          outlet_id?: string | null
          satuan?: string
          stok?: number
          stok_minimum?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      kds_tickets: {
        Row: {
          created_at: string
          id: string
          items: Json
          order_id: string
          ready_at: string | null
          served_at: string | null
          started_at: string | null
          station: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          order_id: string
          ready_at?: string | null
          served_at?: string | null
          started_at?: string | null
          station?: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          order_id?: string
          ready_at?: string | null
          served_at?: string | null
          started_at?: string | null
          station?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "kds_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          dibaca: boolean
          id: string
          jenis: string
          judul: string
          outlet_id: string | null
          pesan: string | null
        }
        Insert: {
          created_at?: string
          dibaca?: boolean
          id?: string
          jenis: string
          judul: string
          outlet_id?: string | null
          pesan?: string | null
        }
        Update: {
          created_at?: string
          dibaca?: boolean
          id?: string
          jenis?: string
          judul?: string
          outlet_id?: string | null
          pesan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          nama: string
          outlet_id: string | null
          pin_hash: string
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          nama: string
          outlet_id?: string | null
          pin_hash: string
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          nama?: string
          outlet_id?: string | null
          pin_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operators_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          harga: number
          id: string
          modifiers: Json
          nama_produk: string
          note: string | null
          order_id: string
          product_id: string | null
          qty: number
          station: string
          subtotal: number
        }
        Insert: {
          created_at?: string
          harga?: number
          id?: string
          modifiers?: Json
          nama_produk: string
          note?: string | null
          order_id: string
          product_id?: string | null
          qty?: number
          station?: string
          subtotal?: number
        }
        Update: {
          created_at?: string
          harga?: number
          id?: string
          modifiers?: Json
          nama_produk?: string
          note?: string | null
          order_id?: string
          product_id?: string | null
          qty?: number
          station?: string
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_logs: {
        Row: {
          alasan: string | null
          changed_by: string | null
          changed_by_role: Database["public"]["Enums"]["app_role"] | null
          created_at: string
          id: string
          order_id: string
          status_dari: Database["public"]["Enums"]["order_status"] | null
          status_ke: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          alasan?: string | null
          changed_by?: string | null
          changed_by_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          id?: string
          order_id: string
          status_dari?: Database["public"]["Enums"]["order_status"] | null
          status_ke: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          alasan?: string | null
          changed_by?: string | null
          changed_by_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          id?: string
          order_id?: string
          status_dari?: Database["public"]["Enums"]["order_status"] | null
          status_ke?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          alasan: string | null
          catatan: string | null
          change_amount: number
          courier: string | null
          created_at: string
          crm_customer_id: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          destination_id: string | null
          destination_label: string | null
          diambil_driver_at: string | null
          diambil_kasir_at: string | null
          discount: number
          driver_id: string | null
          held: boolean
          id: string
          items: Json
          kasir_id: string | null
          kds_status: string
          metode_bayar: string
          operator_id: string | null
          order_code: string
          order_type: string
          outlet_id: string | null
          paid_amount: number
          paid_at: string | null
          payment_reference: string | null
          payment_status: string
          qris_image_url: string | null
          qris_payload: string | null
          selesai_at: string | null
          service: string | null
          service_charge: number
          shift_id: string | null
          shipping_cost: number
          siap_antar_at: string | null
          source: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          table_id: string | null
          tax: number
          total: number
          updated_at: string
          void_reason: string | null
          voided_at: string | null
          weight_grams: number
        }
        Insert: {
          address?: string | null
          alasan?: string | null
          catatan?: string | null
          change_amount?: number
          courier?: string | null
          created_at?: string
          crm_customer_id?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          destination_id?: string | null
          destination_label?: string | null
          diambil_driver_at?: string | null
          diambil_kasir_at?: string | null
          discount?: number
          driver_id?: string | null
          held?: boolean
          id?: string
          items?: Json
          kasir_id?: string | null
          kds_status?: string
          metode_bayar?: string
          operator_id?: string | null
          order_code: string
          order_type?: string
          outlet_id?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string
          qris_image_url?: string | null
          qris_payload?: string | null
          selesai_at?: string | null
          service?: string | null
          service_charge?: number
          shift_id?: string | null
          shipping_cost?: number
          siap_antar_at?: string | null
          source?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          table_id?: string | null
          tax?: number
          total?: number
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
          weight_grams?: number
        }
        Update: {
          address?: string | null
          alasan?: string | null
          catatan?: string | null
          change_amount?: number
          courier?: string | null
          created_at?: string
          crm_customer_id?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          destination_id?: string | null
          destination_label?: string | null
          diambil_driver_at?: string | null
          diambil_kasir_at?: string | null
          discount?: number
          driver_id?: string | null
          held?: boolean
          id?: string
          items?: Json
          kasir_id?: string | null
          kds_status?: string
          metode_bayar?: string
          operator_id?: string | null
          order_code?: string
          order_type?: string
          outlet_id?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string
          qris_image_url?: string | null
          qris_payload?: string | null
          selesai_at?: string | null
          service?: string | null
          service_charge?: number
          shift_id?: string | null
          shipping_cost?: number
          siap_antar_at?: string | null
          source?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          table_id?: string | null
          tax?: number
          total?: number
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      outlets: {
        Row: {
          aktif: boolean
          alamat: string | null
          created_at: string
          id: string
          nama: string
          pajak_persen: number
          phone: string | null
          service_persen: number
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          alamat?: string | null
          created_at?: string
          id?: string
          nama: string
          pajak_persen?: number
          phone?: string | null
          service_persen?: number
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          alamat?: string | null
          created_at?: string
          id?: string
          nama?: string
          pajak_persen?: number
          phone?: string | null
          service_persen?: number
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          created_at: string
          diterima: number
          id: string
          jumlah: number
          kembalian: number
          metode: string
          operator_id: string | null
          order_id: string
          referensi: string | null
          shift_id: string | null
        }
        Insert: {
          created_at?: string
          diterima?: number
          id?: string
          jumlah?: number
          kembalian?: number
          metode: string
          operator_id?: string | null
          order_id: string
          referensi?: string | null
          shift_id?: string | null
        }
        Update: {
          created_at?: string
          diterima?: number
          id?: string
          jumlah?: number
          kembalian?: number
          metode?: string
          operator_id?: string | null
          order_id?: string
          referensi?: string | null
          shift_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      product_modifiers: {
        Row: {
          aktif: boolean
          created_at: string
          grup: string
          harga: number
          id: string
          nama: string
          product_id: string | null
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          grup?: string
          harga?: number
          id?: string
          nama: string
          product_id?: string | null
        }
        Update: {
          aktif?: boolean
          created_at?: string
          grup?: string
          harga?: number
          id?: string
          nama?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_modifiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          aktif: boolean
          category_id: string | null
          created_at: string
          deskripsi: string
          foto_url: string | null
          harga: number
          id: string
          nama: string
          rating: number
          restaurant: string
          stok: number
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          category_id?: string | null
          created_at?: string
          deskripsi?: string
          foto_url?: string | null
          harga?: number
          id?: string
          nama: string
          rating?: number
          restaurant?: string
          stok?: number
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          category_id?: string | null
          created_at?: string
          deskripsi?: string
          foto_url?: string | null
          harga?: number
          id?: string
          nama?: string
          rating?: number
          restaurant?: string
          stok?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          nama: string
          phone: string | null
          saldo: number
          status_online: boolean
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id: string
          nama?: string
          phone?: string | null
          saldo?: number
          status_online?: boolean
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          nama?: string
          phone?: string | null
          saldo?: number
          status_online?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          catatan: string | null
          created_at: string
          id: string
          items: Json
          outlet_id: string | null
          received_at: string | null
          status: string
          supplier_id: string | null
          total: number
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          id?: string
          items?: Json
          outlet_id?: string | null
          received_at?: string | null
          status?: string
          supplier_id?: string | null
          total?: number
        }
        Update: {
          catatan?: string | null
          created_at?: string
          id?: string
          items?: Json
          outlet_id?: string | null
          received_at?: string | null
          status?: string
          supplier_id?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          jumlah: number
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          jumlah?: number
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          jumlah?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          catatan: string | null
          created_at: string
          dibuka_at: string
          ditutup_at: string | null
          id: string
          kas_akhir: number | null
          kas_awal: number
          kas_sistem: number | null
          operator_id: string | null
          outlet_id: string | null
          selisih: number | null
          status: string
          total_penjualan: number
          total_transaksi: number
          user_id: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          dibuka_at?: string
          ditutup_at?: string | null
          id?: string
          kas_akhir?: number | null
          kas_awal?: number
          kas_sistem?: number | null
          operator_id?: string | null
          outlet_id?: string | null
          selisih?: number | null
          status?: string
          total_penjualan?: number
          total_transaksi?: number
          user_id?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string
          dibuka_at?: string
          ditutup_at?: string | null
          id?: string
          kas_akhir?: number | null
          kas_awal?: number
          kas_sistem?: number | null
          operator_id?: string | null
          outlet_id?: string | null
          selisih?: number | null
          status?: string
          total_penjualan?: number
          total_transaksi?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string | null
          jenis: string
          jumlah: number
          keterangan: string | null
          operator_id: string | null
          order_id: string | null
          product_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id?: string | null
          jenis: string
          jumlah: number
          keterangan?: string | null
          operator_id?: string | null
          order_id?: string | null
          product_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string | null
          jenis?: string
          jumlah?: number
          keterangan?: string | null
          operator_id?: string | null
          order_id?: string | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          alamat: string | null
          created_at: string
          id: string
          nama: string
          phone: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          id?: string
          nama: string
          phone?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string
          id?: string
          nama?: string
          phone?: string | null
        }
        Relationships: []
      }
      tables: {
        Row: {
          created_at: string
          current_order_id: string | null
          id: string
          kapasitas: number
          nomor: string
          outlet_id: string | null
          qr_code: string | null
          status: string
        }
        Insert: {
          created_at?: string
          current_order_id?: string | null
          id?: string
          kapasitas?: number
          nomor: string
          outlet_id?: string | null
          qr_code?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          current_order_id?: string | null
          id?: string
          kapasitas?: number
          nomor?: string
          outlet_id?: string | null
          qr_code?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tables_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_logs: {
        Row: {
          created_at: string
          id: string
          jenis: string
          jumlah: number
          keterangan: string | null
          order_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis: string
          jumlah: number
          keterangan?: string | null
          order_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis?: string
          jumlah?: number
          keterangan?: string | null
          order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_product_stock: {
        Args: { _delta: number; _product_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "customer" | "kasir" | "driver" | "admin"
      order_status:
        | "menunggu"
        | "diproses"
        | "siap_antar"
        | "diambil_driver"
        | "diantar"
        | "selesai"
        | "ditolak"
        | "gagal_antar"
        | "hold"
        | "dibayar"
        | "void"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "kasir", "driver", "admin"],
      order_status: [
        "menunggu",
        "diproses",
        "siap_antar",
        "diambil_driver",
        "diantar",
        "selesai",
        "ditolak",
        "gagal_antar",
        "hold",
        "dibayar",
        "void",
      ],
    },
  },
} as const
