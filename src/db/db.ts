import { supabase } from "../db/supabaseClient";

export interface Product {
    id: number;
    product: string;
    price: number;
    quantity: number;
    image_url: string;
}

export interface Venta {
    id: string;
    fecha_venta: Date;
    total_venta: number;
}

export interface DetalleVenta {
    id: string;
    venta_id: string;
    producto_id: string;
    producto_nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export interface ItemVenta {
    productoId: string;
    cantidad: number;
}

export interface ProductoVendido {
    producto_id: number;
    product: string;
    price: number;
    cantidad_vendida: number;
    total_vendido: number;
  }

// Obtener todos los productos
export const getAllProducts = async (): Promise<Product[] | null> => {
    try {
        const { data, error } = await supabase
            .from("Productos") // Nombre correcto de la tabla
            .select("id, product, price, image_url, quantity");

        if (error) {
            console.error("Error fetching products:", error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error en la consulta:", error);
        return null;
    }
};

// Obtener un producto por ID
export const getProductById = async (id: number): Promise<Product | null> => {
    try {
        const { data, error } = await supabase
            .from("Productos")
            .select("id, product, price, image_url, quantity")
            .eq("id", id)
            .single(); 

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        return null;
    }
};

// Agregar un nuevo producto
export const addProduct = async (product: Omit<Product, "id" | "image_url">): Promise<Product | null> => {
    try {
        const { data, error } = await supabase
            .from("Productos")
            .insert([product])
            .select()
            .single(); 

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error adding product:", error);
        return null;
    }
};

// Editar un producto por ID
export const updateProduct = async (id: number, updatedProduct: Partial<Omit<Product, "id">>): Promise<Product | null> => {
    try {
        const { data, error } = await supabase
            .from("Productos")
            .update(updatedProduct)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Error updating product with ID ${id}:`, error);
        return null;
    }
};

// Eliminar un producto por ID
export const deleteProduct = async (id: number): Promise<boolean> => {
    try {
        const { error } = await supabase.from("Productos").delete().eq("id", id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error(`Error deleting product with ID ${id}:`, error);
        return false;
    }
};

// Crear una venta
export const crearVenta = async (total: number): Promise<Venta | null> => {
    const { data: ventaData, error: ventaError } = await supabase
      .from('Sales')
      .insert({ fecha_venta: new Date(), total_venta: total })
      .select('*') // traer todos los campos
      .single();
  
    if (ventaError) {
      console.error("Error al crear la venta:", ventaError);
      return null;
    }
  
    return ventaData as Venta;
  };

// Crear detalles de venta
export const crearDetalleVenta = async (ventaId: string, items: ItemVenta[]): Promise<void> => {
    const detallesParaInsertar: Omit<DetalleVenta, 'id' | 'created_at' | 'updated_at'>[] = [];

    for (const item of items) {
      // 1. Verificar el stock actual y obtener información del producto
      const { data: stockData, error: stockError } = await supabase
        .from("Productos")
        .select("product, price, quantity")
        .eq("id", item.productoId)
        .single();
  
      if (stockError || !stockData) {
        console.error(`Error al obtener el stock del producto ${item.productoId}:`, stockError);
        return; // Salir si falla obtener información
      }
  
      const { product: nombreProducto, price: precioUnitario, quantity: stockDisponible } = stockData;
  
      // 2. Validar si hay suficiente stock
      if (stockDisponible < item.cantidad) {
        console.warn(`Stock insuficiente para el producto ${item.productoId}. Disponible: ${stockDisponible}, requerido: ${item.cantidad}`);
        return; // También puedes lanzar una excepción o devolver un error estructurado si prefieres
      }
  
      // 3. Preparar detalle con el nombre del producto
      const subtotal = precioUnitario * item.cantidad;
      detallesParaInsertar.push({
        venta_id: ventaId,
        producto_id: item.productoId,
        producto_nombre: nombreProducto, // Guardar el nombre del producto
        cantidad: item.cantidad,
        precio_unitario: precioUnitario,
        subtotal,
      });
    }
  
    // 4. Insertar los detalles si todo es válido
    if (detallesParaInsertar.length > 0) {
      const { error: detalleError } = await supabase
        .from('SalesDetails')
        .insert(detallesParaInsertar);
  
        if (!detalleError) {
            // Descontar el stock de cada producto usando la función RPC
            for (const item of items) {
              const { error: updateError } = await supabase.rpc("decrement_stock", {
                product_id: item.productoId,
                qty: item.cantidad,
              });
          
              if (updateError) {
                console.error(`Error al actualizar el stock del producto ${item.productoId}:`, updateError);
            }
        }
        }
    }
};

// Obtener todas las ventas
export const obtenerTotalVentas = async (): Promise<number> => {
    const { data, error } = await supabase
      .from('Sales')
      .select('total_venta', { count: 'exact' , head: false });

    if (error) {
        console.error("Error fetching total sales:", error);
        throw error;
    }

    const total = data.reduce((acc, venta) => acc + venta.total_venta, 0);
    return total;
};

// Obtener detalles de todas las ventas
export const getSales = async (): Promise<Venta[] | null> => {
    try {
        const { data, error } = await supabase
            .from("Sales")
            .select("id, fecha_venta, total_venta");

        if (error) {
            console.error("Error fetching sales details:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error en la consulta:", error);
        return null;
    }
};

// Valida que todos los productos tengan suficiente stock
export const validarStockDisponible = async (items: { productoId: string; cantidad: number }[]): Promise<boolean> => {
    for (const item of items) {
      const { data: stockData, error: stockError } = await supabase
        .from("Productos")
        .select("quantity")
        .eq("id", item.productoId)
        .single();
  
      if (stockError || !stockData) {
        console.error(`Error al verificar el stock del producto ${item.productoId}:`, stockError);
        return false;
      }
  
      if (stockData.quantity < item.cantidad) {
        console.warn(`Stock insuficiente para el producto ${item.productoId}. Disponible: ${stockData.quantity}, requerido: ${item.cantidad}`);
        return false;
      }
    }
  
    return true;
  };

export const getSalesDetailsByDateRange = async (startDate: string, endDate: string): Promise<ProductoVendido[]> => {
    try {
      // Convertir fechas para incluir todo el día
      const fechaInicio = new Date(startDate);
      fechaInicio.setHours(0, 0, 0, 0);
      
      const fechaFin = new Date(endDate);
      fechaFin.setHours(23, 59, 59, 999);
  
      const { data, error } = await supabase
        .from('SalesDetails')
        .select(`
          producto_id,
          producto_nombre,
          precio_unitario,
          cantidad,
          subtotal,
          Sales!inner(fecha_venta)
        `)
        .gte('Sales.fecha_venta', fechaInicio.toISOString())
        .lte('Sales.fecha_venta', fechaFin.toISOString());
  
      if (error) {
        console.error("Error fetching sales details by date range:", error);
        return [];
      }
  
      // Agrupar por producto y sumar cantidades
      const productosAgrupados: { [key: number]: ProductoVendido } = {};
  
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?.forEach((item: any) => {
        const productoId = item.producto_id;
        
        if (!productosAgrupados[productoId]) {
          productosAgrupados[productoId] = {
            producto_id: productoId,
            product: item.producto_nombre, // Usar producto_nombre en lugar del join
            price: item.precio_unitario,
            cantidad_vendida: 0,
            total_vendido: 0
          };
        }
        
        productosAgrupados[productoId].cantidad_vendida += item.cantidad;
        productosAgrupados[productoId].total_vendido += item.subtotal;
      });
  
      // Convertir a array y ordenar por total vendido (descendente)
      return Object.values(productosAgrupados)
        .sort((a, b) => b.total_vendido - a.total_vendido);
  
    } catch (error) {
      console.error("Error en getSalesDetailsByDateRange:", error);
      return [];
    }
  };
  
