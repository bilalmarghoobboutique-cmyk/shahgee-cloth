// ============================================
// SHAH GEE CLOTH & BOUTIQUE HOUSE
// Supabase Configuration
// ============================================

// Aapki Supabase keys
const SUPABASE_URL = 'https://auutzsybmsiulubbywfn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dXR6c3libXNpdWx1YmJ5d2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4ODEyNDksImV4cCI6MjEwNjQ1NzI0OX0.0BVzmc6Ntlvp-T8PXTihoxJIhB-fDg2YVRpgMHMF9x4';

// Supabase client initialize karein
let supabaseClient = null;

// Load Supabase library from CDN
function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase connected!');
        return supabaseClient;
    } else {
        console.error('❌ Supabase library load nahi hui');
        return null;
    }
}

// ============================================
// PRODUCTS FUNCTIONS
// ============================================

// Saare products Supabase se load karo
async function fetchProductsFromSupabase() {
    if (!supabaseClient) initSupabase();
    if (!supabaseClient) return [];

    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Products fetch error:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Products fetch exception:', err);
        return [];
    }
}

// Naya product Supabase mein add karo
async function addProductToSupabase(productData) {
    if (!supabaseClient) initSupabase();
    if (!supabaseClient) return { success: false, error: 'Supabase not initialized' };

    try {
        const { data, error } = await supabaseClient
            .from('products')
            .insert([productData])
            .select();

        if (error) {
            console.error('Product add error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data[0] };
    } catch (err) {
        console.error('Product add exception:', err);
        return { success: false, error: err.message };
    }
}

// Product update karo
async function updateProductInSupabase(productId, updates) {
    if (!supabaseClient) initSupabase();
    if (!supabaseClient) return { success: false };

    try {
        const { data, error } = await supabaseClient
            .from('products')
            .update(updates)
            .eq('id', productId)
            .select();

        if (error) {
            console.error('Product update error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// Product delete karo
async function deleteProductFromSupabase(productId) {
    if (!supabaseClient) initSupabase();
    if (!supabaseClient) return { success: false };

    try {
        const { error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) {
            console.error('Product delete error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// ============================================
// ORDERS FUNCTIONS
// ============================================

// Naya order Supabase mein save karo
async function saveOrderToSupabase(orderData) {
    if (!supabaseClient) initSupabase();
    if (!supabaseClient) return { success: false, error: 'Supabase not initialized' };

    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .insert([orderData])
            .select();

        if (error) {
            console.error('Order save error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data[0] };
    } catch (err) {
        console.error('Order save exception:', err);
        return { success: false, error: err.message };
    }
}

// Saare orders Supabase se load karo
async function fetchOrdersFromSupabase() {
    if (!supabaseClient) initSupabase();
    if (!supabaseClient) return [];

    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Orders fetch error:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Orders fetch exception:', err);
        return [];
    }
}

// Order status update karo
async function updateOrderStatusInSupabase(orderId, newStatus) {
    if (!supabaseClient) initSupabase();
    if (!supabaseClient) return { success: false };

    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .update({ status: newStatus })
            .eq('order_id', orderId)
            .select();

        if (error) {
            console.error('Order status update error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// Order ID se single order laao
async function fetchOrderByIdFromSupabase(orderId) {
    if (!supabaseClient) initSupabase();
    if (!supabaseClient) return null;

    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('order_id', orderId)
            .single();

        if (error) return null;
        return data;
    } catch (err) {
        return null;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initSupabase();
});