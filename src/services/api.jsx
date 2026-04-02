import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080";

const API = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("favorites");

      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/signup"
      ) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

export const getHotels = (params) =>
  API.get("/hotels", { params }).then((r) => r.data.data);

export const getHotelById = (id) =>
  API.get(`/hotels/${id}`).then((r) => r.data.data);

export const searchHotels = (params) =>
  API.get("/hotels/advanced-search", { params }).then((r) => r.data.data);

export const getTopHotels = (params) =>
  API.get("/hotels/top", { params }).then((r) => r.data.data);

export const getRoomsByHotel = (hotelId) =>
  API.get(`/rooms/hotel/${hotelId}`).then((r) => r.data.data);

export const getAvailableRooms = (checkIn, checkOut) =>
  API.get("/rooms/available", { params: { checkIn, checkOut } }).then((r) => r.data.data);

export const createBooking = (data) =>
  API.post("/bookings", data).then((r) => r.data.data);

export const getMyBookings = () =>
  API.get("/bookings/my").then((r) => r.data.data);

export const cancelBooking = (id) =>
  API.put(`/bookings/cancel/${id}`).then((r) => r.data.data);

export const getBookingSummary = () =>
  API.get("/bookings/summary").then((r) => r.data.data);

export const processPayment = (bookingId) =>
  API.post(`/payment/pay/${bookingId}`).then((r) => r.data.data);

export const getUpiLink = (amount) =>
  API.get("/payment/upi-link", { params: { amount } }).then((r) => r.data.data);

export const getAdminStats = () =>
  API.get("/admin/stats").then((r) => r.data.data);

export const getAllBookings = () =>
  API.get("/bookings").then((r) => r.data.data);

export const getAllUsers = () =>
  API.get("/users").then((r) => r.data);

export const deleteUser = (id) =>
  API.delete(`/users/${id}`).then((r) => r.data);

export const addHotel = (data) =>
  API.post("/hotels", data).then((r) => r.data.data);

export const deleteHotel = (id) =>
  API.delete(`/hotels/${id}`).then((r) => r.data);

export const addRoom = (data) =>
  API.post("/rooms", data).then((r) => r.data.data);

export const getAllHotels = () =>
  API.get("/hotels", { params: { page: 0, size: 100 } }).then((r) => {
    const d = r.data?.data;
    return d?.content || [];
  });

export const addRating = (data) =>
  API.post("/ratings", data).then((r) => r.data.data);

export const getRatings = (hotelId) =>
  API.get(`/ratings/${hotelId}`).then((r) => r.data.data);

export default API;