import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
}, (error) => Promise.reject(error));

// Handle 401 globally - redirect to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── HELPER: Backend wraps all responses in { success, message, data }
// These helpers unwrap .data.data automatically
export const getHotels = (params) => API.get("/hotels", { params }).then(r => r.data.data);
export const getHotelById = (id) => API.get(`/hotels/${id}`).then(r => r.data.data);
export const searchHotels = (params) => API.get("/hotels/advanced-search", { params }).then(r => r.data.data);
export const getTopHotels = () => API.get("/hotels/top").then(r => r.data.data);
export const getRoomsByHotel = (hotelId) => API.get(`/rooms/hotel/${hotelId}`).then(r => r.data.data);
export const createBooking = (data) => API.post("/bookings", data).then(r => r.data.data);
export const getMyBookings = () => API.get("/bookings/my").then(r => r.data.data);
export const cancelBooking = (id) => API.put(`/bookings/cancel/${id}`).then(r => r.data.data);
export const processPayment = (bookingId) => API.post(`/payment/pay/${bookingId}`).then(r => r.data.data);
export const getAdminStats = () => API.get("/admin/stats").then(r => r.data.data);
export const getAllBookings = () => API.get("/bookings").then(r => r.data.data);
export const getAllUsers = () => API.get("/users").then(r => r.data.data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const addHotel = (data) => API.post("/hotels", data).then(r => r.data.data);
export const deleteHotel = (id) => API.delete(`/hotels/${id}`);
export const addRoom = (data) => API.post("/rooms", data).then(r => r.data.data);
export const getAvailableRooms = (checkIn, checkOut) =>
  API.get("/rooms/available", { params: { checkIn, checkOut } }).then(r => r.data.data);
export const getBookingSummary = () => API.get("/bookings/summary").then(r => r.data.data);
export const addRating = (data) => API.post("/ratings", data).then(r => r.data.data);
export const getRatings = (hotelId) => API.get(`/ratings/${hotelId}`).then(r => r.data.data);

export default API;

// Alias used by AdminDashboard
export const getAllHotels = () => API.get("/hotels?size=100").then(r => {
  const d = r.data?.data;
  return d?.content || (Array.isArray(d) ? d : []);
});