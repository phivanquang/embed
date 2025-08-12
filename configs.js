// Cấu hình đường dẫn lấy dữ liệu từ Booking Engine
const EZ_BE_URL = 'https://booking.ezcms.vn';

//Đường dẫn đến trang sẽ hiển thị danh sách phòng khách sạn nếu khách sạn không cấu hình
const EZ_BE_DEFAULT_PATH = 'https://booking.ezcms.vn/hotel/BeDetailHotel';

window.EZ_BE_URL = EZ_BE_URL;
window.EZ_BE_DEFAULT_PATH = EZ_BE_DEFAULT_PATH;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EZ_BE_URL, EZ_BE_DEFAULT_PATH };
}
