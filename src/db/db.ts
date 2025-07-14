import { supabase } from "../db/supabaseClient";

export interface Product {
    id: number;
    product: string;
    price: number;
    quantity: number;
    image_url: string;
    is_active: boolean;
}

export interface Venta {
    id: string; // UUID
    fecha_venta: Date;
    total_venta: number;
    metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'otro';
    total_items: number;
    descuento: number;
    subtotal: number;
    vendedor?: string;
    notas?: string;
    estado: 'completada' | 'cancelada' | 'pendiente';
    created_at: Date;
    updated_at: Date;
}

export interface DetalleVenta {
    id: string; // UUID
    venta_id: string; // UUID de la venta
    producto_id: number;
    // Información histórica del producto
    producto_nombre: string;
    producto_categoria?: string;
    producto_descripcion?: string;
    // Precios y cantidades
    precio_unitario: number;
    cantidad: number;
    subtotal: number;
    descuento_item: number;
    total_item: number;
    costo_producto?: number;
    created_at: Date;
}

export interface ItemVenta {
    productoId: number; // Cambiar de string a number para consistency
    cantidad: number;
}

export interface ProductoVendido {
    producto_id: number;
    product: string;
    price: number;
    cantidad_vendida: number;
    total_vendido: number;
  }

export interface VentaCompleta {
    venta_id: string;
    fecha_venta: Date;
    total_venta: number;
    metodo_pago: string;
    vendedor?: string;
    estado: string;
    detalles: DetalleVenta[];
}

export interface CrearVentaRequest {
    items: ItemVenta[];
    metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia' | 'otro';
    vendedor?: string;
    notas?: string;
    descuento?: number;
}

// Obtener todos los productos (solo activos)
export const getAllProducts = async (): Promise<Product[] | null> => {
    try {
        const { data, error } = await supabase
            .from("Productos") // Nombre correcto de la tabla
            .select("id, product, price, image_url, quantity, is_active")
            .eq("is_active", true); // Solo productos activos

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

// Obtener un producto por ID (incluso inactivos, para reportes)
export const getProductById = async (id: number): Promise<Product | null> => {
    try {
        const { data, error } = await supabase
            .from("Productos")
            .select("id, product, price, image_url, quantity, is_active")
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
export const addProduct = async (product: Omit<Product, "id" | "image_url" | "is_active">): Promise<Product | null> => {
    try {
        const { data, error } = await supabase
            .from("Productos")
            .insert([{ ...product, is_active: true }])
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

// SOFT DELETE: Marcar producto como inactivo en lugar de eliminarlo
export const deleteProduct = async (id: number): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from("Productos")
            .update({ is_active: false })
            .eq("id", id);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error(`Error soft deleting product with ID ${id}:`, error);
        return false;
    }
};

// Restaurar un producto eliminado (soft delete)
export const restoreProduct = async (id: number): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from("Productos")
            .update({ is_active: true })
            .eq("id", id);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error(`Error restoring product with ID ${id}:`, error);
        return false;
    }
};

// Obtener productos eliminados (para administración)
export const getDeletedProducts = async (): Promise<Product[] | null> => {
    try {
        const { data, error } = await supabase
            .from("Productos")
            .select("id, product, price, image_url, quantity, is_active")
            .eq("is_active", false);

        if (error) {
            console.error("Error fetching deleted products:", error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error en la consulta:", error);
        return null;
    }
};

// Crear una venta con la nueva estructura
export const crearVenta = async (
    items: ItemVenta[], 
    metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'otro' = 'efectivo',
    vendedor?: string,
    notas?: string,
    descuento: number = 0
): Promise<Venta | null> => {
    // Calcular totales
    let subtotal = 0;
    for (const item of items) {
        const producto = await getProductById(item.productoId);
        if (producto) {
            subtotal += producto.price * item.cantidad;
        }
    }
    
    const total_venta = subtotal - descuento;
    const total_items = items.reduce((acc, item) => acc + item.cantidad, 0);

    const { data: ventaData, error: ventaError } = await supabase
      .from('Sales')
      .insert({ 
          fecha_venta: new Date(),
          total_venta,
          metodo_pago,
          total_items,
          descuento,
          subtotal,
          vendedor,
          notas,
          estado: 'completada'
      })
      .select('*')
      .single();
  
    if (ventaError) {
      console.error("Error al crear la venta:", ventaError);
      return null;
    }
  
    return ventaData as Venta;
};

// Crear detalles de venta con nueva estructura
export const crearDetalleVenta = async (ventaId: string, items: ItemVenta[]): Promise<void> => {
    const detallesParaInsertar: Omit<DetalleVenta, 'id' | 'created_at'>[] = [];

    for (const item of items) {
      // 1. Verificar el stock actual y obtener información del producto (solo activos)
      const { data: stockData, error: stockError } = await supabase
        .from("Productos")
        .select("product, price, quantity, is_active")
        .eq("id", item.productoId)
        .eq("is_active", true) // Solo productos activos
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
      const descuento_item = 0; // Por ahora sin descuentos por item
      const total_item = subtotal - descuento_item;
      
      detallesParaInsertar.push({
        venta_id: ventaId,
        producto_id: item.productoId, // Ahora es number
        producto_nombre: nombreProducto,
        precio_unitario: precioUnitario,
        cantidad: item.cantidad,
        subtotal,
        descuento_item,
        total_item,
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

// Obtener detalles de todas las ventas con todos los campos
export const getSales = async (): Promise<Venta[] | null> => {
    try {
        const { data, error } = await supabase
            .from("Sales")
            .select(`
                id, 
                fecha_venta, 
                total_venta, 
                metodo_pago, 
                total_items, 
                descuento, 
                subtotal, 
                vendedor, 
                notas, 
                estado, 
                created_at, 
                updated_at
            `)
            .eq("estado", "completada")
            .order("fecha_venta", { ascending: false });

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

// Validar stock solo en productos activos
export const validarStockDisponible = async (items: { productoId: number; cantidad: number }[]): Promise<boolean> => {
    for (const item of items) {
      const { data: stockData, error: stockError } = await supabase
        .from("Productos")
        .select("quantity, is_active")
        .eq("id", item.productoId)
        .eq("is_active", true) // Solo productos activos
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

      console.log("Buscando ventas desde:", fechaInicio.toISOString(), "hasta:", fechaFin.toISOString());

      // Primero verificar si existen las nuevas tablas con datos
      const { error: testError } = await supabase
        .from('Sales')
        .select('id')
        .limit(1);

      if (testError) {
        console.log("Las nuevas tablas no existen aún, intentando con estructura anterior...");
        
        // Fallback a la estructura anterior si las nuevas tablas no existen
        const { data: oldData, error: oldError } = await supabase
          .from('SalesDetails')
          .select(`
            producto_id,
            producto_nombre,
            precio_unitario,
            cantidad,
            subtotal
          `);

        if (oldError) {
          console.error("Error con estructura anterior:", oldError);
          return [];
        }

        if (!oldData || oldData.length === 0) {
          console.log("No hay datos en la estructura anterior");
          return [];
        }

        // Procesar datos de estructura anterior
        const productosAgrupados: { [key: number]: ProductoVendido } = {};
        
        oldData.forEach((item: {
          producto_id: number;
          producto_nombre: string;
          precio_unitario: number;
          cantidad: number;
          subtotal: number;
        }) => {
          const productoId = item.producto_id;
          
          if (!productosAgrupados[productoId]) {
            productosAgrupados[productoId] = {
              producto_id: productoId,
              product: item.producto_nombre,
              price: item.precio_unitario,
              cantidad_vendida: 0,
              total_vendido: 0
            };
          }
          
          productosAgrupados[productoId].cantidad_vendida += item.cantidad;
          productosAgrupados[productoId].total_vendido += item.subtotal;
        });

        return Object.values(productosAgrupados)
          .sort((a, b) => b.total_vendido - a.total_vendido);
      }

      // Usar la nueva estructura con JOIN explícito
      const { data, error } = await supabase
        .from('SalesDetails')
        .select(`
          producto_id,
          producto_nombre,
          precio_unitario,
          cantidad,
          total_item,
          Sales!inner (
            fecha_venta,
            estado
          )
        `)
        .eq('Sales.estado', 'completada')
        .gte('Sales.fecha_venta', fechaInicio.toISOString())
        .lte('Sales.fecha_venta', fechaFin.toISOString());
  
      if (error) {
        console.error("Error fetching sales details by date range:", error);
        return [];
      }

      console.log("Datos obtenidos de la nueva estructura:", data);
  
      if (!data || data.length === 0) {
        console.log("No hay datos en el rango de fechas especificado");
        return [];
      }

      // Agrupar por producto y sumar cantidades (nueva estructura)
      const productosAgrupados: { [key: number]: ProductoVendido } = {};
  
      data.forEach((item: {
        producto_id: number;
        producto_nombre: string;
        precio_unitario: number;
        cantidad: number;
        total_item: number;
      }) => {
        const productoId = item.producto_id;
        
        if (!productosAgrupados[productoId]) {
          productosAgrupados[productoId] = {
            producto_id: productoId,
            product: item.producto_nombre,
            price: item.precio_unitario,
            cantidad_vendida: 0,
            total_vendido: 0
          };
        }
        
        productosAgrupados[productoId].cantidad_vendida += item.cantidad;
        productosAgrupados[productoId].total_vendido += item.total_item; // Usar total_item en lugar de subtotal
      });
  
      // Convertir a array y ordenar por total vendido (descendente)
      return Object.values(productosAgrupados)
        .sort((a, b) => b.total_vendido - a.total_vendido);
  
    } catch (error) {
      console.error("Error en getSalesDetailsByDateRange:", error);
      return [];
    }
  };
  

// Función simplificada para crear una venta completa
export const crearVentaCompleta = async (
    items: ItemVenta[],
    metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'otro' = 'efectivo',
    vendedor?: string,
    notas?: string,
    descuento: number = 0
): Promise<VentaCompleta | null> => {
    try {
        // 1. Validar stock antes de procesar
        const stockValido = await validarStockDisponible(items);
        if (!stockValido) {
            console.error("Stock insuficiente para procesar la venta");
            return null;
        }

        // 2. Crear la venta
        const venta = await crearVenta(items, metodo_pago, vendedor, notas, descuento);
        if (!venta) {
            console.error("Error al crear la venta");
            return null;
        }

        // 3. Crear los detalles de venta
        await crearDetalleVenta(venta.id, items);

        // 4. Obtener los detalles creados para retornar venta completa
        const { data: detalles, error } = await supabase
            .from('SalesDetails')
            .select('*')
            .eq('venta_id', venta.id);

        if (error) {
            console.error("Error al obtener detalles de venta:", error);
            return null;
        }

        return {
            venta_id: venta.id,
            fecha_venta: venta.fecha_venta,
            total_venta: venta.total_venta,
            metodo_pago: venta.metodo_pago,
            vendedor: venta.vendedor,
            estado: venta.estado,
            detalles: detalles || []
        };

    } catch (error) {
        console.error("Error en crearVentaCompleta:", error);
        return null;
    }
};

// Obtener una venta completa con sus detalles
export const getVentaCompleta = async (ventaId: string): Promise<VentaCompleta | null> => {
    try {
        // Obtener la venta
        const { data: venta, error: ventaError } = await supabase
            .from('Sales')
            .select('*')
            .eq('id', ventaId)
            .single();

        if (ventaError || !venta) {
            console.error("Error al obtener la venta:", ventaError);
            return null;
        }

        // Obtener los detalles
        const { data: detalles, error: detallesError } = await supabase
            .from('SalesDetails')
            .select('*')
            .eq('venta_id', ventaId);

        if (detallesError) {
            console.error("Error al obtener detalles:", detallesError);
            return null;
        }

        return {
            venta_id: venta.id,
            fecha_venta: venta.fecha_venta,
            total_venta: venta.total_venta,
            metodo_pago: venta.metodo_pago,
            vendedor: venta.vendedor,
            estado: venta.estado,
            detalles: detalles || []
        };

    } catch (error) {
        console.error("Error en getVentaCompleta:", error);
        return null;
    }
};

// Obtener estadísticas de ventas
export const getEstadisticasVentas = async (fechaInicio?: Date, fechaFin?: Date) => {
    try {
        let query = supabase
            .from('VentasCompletas') // Usar la vista creada en SQL
            .select('*');

        if (fechaInicio) {
            query = query.gte('fecha_venta', fechaInicio.toISOString());
        }
        if (fechaFin) {
            query = query.lte('fecha_venta', fechaFin.toISOString());
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error al obtener estadísticas:", error);
            return null;
        }

        // Calcular estadísticas
        const totalVentas = data?.length || 0;
        const ingresoTotal = data?.reduce((sum, venta) => sum + venta.total_venta, 0) || 0;
        const ventaPromedio = totalVentas > 0 ? ingresoTotal / totalVentas : 0;

        return {
            totalVentas,
            ingresoTotal,
            ventaPromedio,
            ventas: data
        };

    } catch (error) {
        console.error("Error en getEstadisticasVentas:", error);
        return null;
    }
};
  

// Función de diagnóstico para verificar el estado de las tablas
export const diagnosticarBaseDatos = async () => {
    console.log("🔍 Iniciando diagnóstico de base de datos...");
    
    try {
        // Verificar tabla Sales (nueva estructura)
        const { data: salesData, error: salesError } = await supabase
            .from('Sales')
            .select('*')
            .limit(5);
            
        if (salesError) {
            console.log("❌ Tabla Sales (nueva): No existe o hay error -", salesError.message);
        } else {
            console.log("✅ Tabla Sales (nueva): Existe");
            console.log(`📊 Registros encontrados: ${salesData?.length || 0}`);
            if (salesData && salesData.length > 0) {
                console.log("📝 Primer registro:", salesData[0]);
            }
        }

        // Verificar tabla SalesDetails (nueva estructura)
        const { data: detailsData, error: detailsError } = await supabase
            .from('SalesDetails')
            .select('*')
            .limit(5);
            
        if (detailsError) {
            console.log("❌ Tabla SalesDetails (nueva): No existe o hay error -", detailsError.message);
        } else {
            console.log("✅ Tabla SalesDetails (nueva): Existe");
            console.log(`📊 Registros encontrados: ${detailsData?.length || 0}`);
            if (detailsData && detailsData.length > 0) {
                console.log("📝 Primer registro:", detailsData[0]);
            }
        }

        // Verificar tabla Productos
        const { data: productsData, error: productsError } = await supabase
            .from('Productos')
            .select('id, product, is_active')
            .limit(5);
            
        if (productsError) {
            console.log("❌ Tabla Productos: Hay error -", productsError.message);
        } else {
            console.log("✅ Tabla Productos: Existe");
            console.log(`📊 Productos totales: ${productsData?.length || 0}`);
            const activos = productsData?.filter(p => p.is_active).length || 0;
            console.log(`📊 Productos activos: ${activos}`);
        }

        // Intentar una consulta JOIN para verificar relaciones
        const { data: joinData, error: joinError } = await supabase
            .from('SalesDetails')
            .select(`
                producto_id,
                producto_nombre,
                cantidad,
                Sales!inner (
                    fecha_venta,
                    total_venta
                )
            `)
            .limit(3);

        if (joinError) {
            console.log("❌ JOIN entre Sales y SalesDetails: Error -", joinError.message);
        } else {
            console.log("✅ JOIN entre Sales y SalesDetails: Funciona");
            console.log(`📊 Registros con JOIN: ${joinData?.length || 0}`);
        }

        return {
            salesExists: !salesError,
            salesCount: salesData?.length || 0,
            detailsExists: !detailsError,
            detailsCount: detailsData?.length || 0,
            productsCount: productsData?.length || 0,
            joinWorks: !joinError
        };

    } catch (error) {
        console.error("💥 Error en diagnóstico:", error);
        return null;
    }
};
  
