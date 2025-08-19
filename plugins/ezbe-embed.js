/**
 * Auth : Quang PV
 * Email: quangpv@ezcloud.vn
 */
(function () {
  const DEFAULT_EZ_BE_URL = 'https://booking.ezcms.vn'; //Đường dẫn mặc định lấy dữ liệu từ Booking Engine
  const DEFAULT_PATH = 'https://booking.ezcms.vn/hotel/BeDetailHotel'; //Đường dẫn mặc định đến trang sẽ hiển thị danh sách phòng khách sạn nếu khách sạn không cấu hình
  const EMBED_SCRIPT_NAME = 'ezbe-embed.js'; // Tên file nhúng
  const CONFIGS_NAME = 'configs.json'; // Tên file configs đặt biến

  async function loadConfig() {
    if (window.configLoadInProgress && window.configLoadPromise) {
      return window.configLoadPromise;
    }

    window.configLoadInProgress = true;
    window.configLoadPromise = new Promise(async (resolve) => {
      let currentScript = window.document.currentScript;
      if (!currentScript || !currentScript.src) {
        const scripts = window.document.getElementsByTagName('script');
        for (let s of scripts) {
          if (s.src && s.src.endsWith(EMBED_SCRIPT_NAME)) {
            currentScript = s;
            break;
          }
        }
      }

      if (!currentScript || !currentScript.src) {
        window.configLoadInProgress = false;
        return resolve({
          EZ_BE_URL: DEFAULT_EZ_BE_URL,
          EZ_BE_DEFAULT_PATH: DEFAULT_PATH,
          IMAGE_404_URL: ''
        });
      }

      const configPath = currentScript.src.replace(/[^\/]+$/, CONFIGS_NAME);
      const imageUrl = currentScript.src.replace(/\/plugins\/.*$/, '/images/404.png');
      try {
        const res = await fetch(configPath);
        if (!res.ok) throw new Error("Config load failed");
        const data = await res.json();
        resolve({
          EZ_BE_URL: data.EZ_BE_URL || DEFAULT_EZ_BE_URL,
          EZ_BE_DEFAULT_PATH: data.EZ_BE_DEFAULT_PATH || DEFAULT_PATH,
          IMAGE_404_URL: imageUrl || ''
        });
      } catch (err) {
        resolve({
          EZ_BE_URL: DEFAULT_EZ_BE_URL,
          EZ_BE_DEFAULT_PATH: DEFAULT_PATH,
          IMAGE_404_URL: imageUrl || ''
        });
      } finally {
        window.configLoadInProgress = false;
      }
    });

    return window.configLoadPromise;
  }

  /**
   * 1. hotel (bắt buộc)
   *    là 1 array object(nếu là chuỗi) hoặc string (nếu chỉ 1 khách sạn)
   *    ví dụ: 
   *      chuỗi khách sạn: [{hotelName: 'Khách sạn A', hotelCode: 'DFND3'}, {hotelName: 'Khách sạn B', hotelCode: 'BFKD'}] 
   *      1 khách sạn: 'DFND3'
   * 2. target (bắt buộc)
   *    là 1 id hoặc 1 class của 1 thẻ tag hiển thị ra form. 
   *     ví dụ: #container hoặc .container
   * 3. path (bắt buộc)
   *   là đường dẫn đến trang sẽ hiển thị danh sách phòng khách sạn
   * 4. lang (không bắt buộc)
   *   là ngôn ngữ của form. hỗ trợ các ngôn ngữ (Anh, Việt, Nhật, Hàn, Trung, Lào, Khmer). Mặc định là tiếng việt
   * 5. background (không bắt buộc)
   *   cho phép thay đổi màu nền form. mặc định là #eee
   * 6. buttonBackground (không bắt buộc)
   *    cho phép thay đổi màu background của button tìm kiếm. mặc định là màu đỏ
   * 7. textColor (không bắt buộc)
   *    cho phép thay đổi màu sắc text của form
   */
  window.initBookingForm = async function ({ hotel, target, path, lang, background, buttonBackground, buttonTextColor, textColor }) {
    if (!hotel || !Array.isArray(hotel)) return;

    if (!path) {
      try {
        const config = await loadConfig();
        path = config.EZ_BE_DEFAULT_PATH;
      } catch (error) {
        path = DEFAULT_PATH;
      }
    }

    const i18n = {
      vi: { hotelEmpty: 'Chưa chọn khách sạn', dateRangeEmpty: 'Chưa chọn ngày đến, ngày đi', roomEmpty: 'Chưa chọn số lượng phòng', adultEmpty: 'Chưa chọn số người lớn', hotel: 'Khách sạn', dateRange: 'Ngày lưu trú', room: 'Số phòng', adults: 'Người lớn', children: 'Trẻ em', promotion: 'Mã khuyến mãi', search: 'Tìm phòng', popupTitle: 'Thông báo', popupMessage: 'Vui lòng điền đủ thông tin.', close: 'Đóng' },
      en: { hotelEmpty: 'No hotel selected', dateRangeEmpty: 'Check-in and check-out dates not selected', roomEmpty: 'Number of rooms not selected', adultEmpty: 'Number of adults not selected', hotel: 'Hotel', dateRange: 'Dates', room: 'Room(s)', adults: 'Adult(s)', children: 'Children', promotion: 'Promotion code', search: 'Search rooms', popupTitle: 'Notice', popupMessage: 'Please fill in all required fields.', close: 'Close' },
      zh: { hotelEmpty: '尚未选择酒店', dateRangeEmpty: '尚未选择入住和退房日期', roomEmpty: '尚未选择房间数量', adultEmpty: '尚未选择成人人数', hotel: '酒店', dateRange: '入住日期', room: '房间数', adults: '成人', children: '儿童', promotion: '优惠码', search: '搜索房间', popupTitle: '通知', popupMessage: '请填写所有必填项。', close: '关闭' },
      ko: { hotelEmpty: '호텔을 선택하지 않았습니다', dateRangeEmpty: '체크인 및 체크아웃 날짜를 선택하지 않았습니다', roomEmpty: '객실 수를 선택하지 않았습니다', adultEmpty: '성인 인원을 선택하지 않았습니다', hotel: '호텔', dateRange: '숙박일', room: '건설', adults: '성인', children: '아이', promotion: '프로모션 코드', search: '객실 검색', popupTitle: '알림', popupMessage: '필수 항목을 모두 입력해주세요.', close: '닫기' },
      ja: { hotelEmpty: 'ホテルが選択されていません', dateRangeEmpty: 'チェックイン日とチェックアウト日が未選択です', roomEmpty: '部屋数が未選択です', adultEmpty: '大人の人数が未選択です', hotel: 'ホテル', dateRange: '宿泊日', room: '部屋数', adults: '大人', children: '子供', promotion: 'プロモーションコード', search: '部屋を検索', popupTitle: '通知', popupMessage: '必須項目をすべて入力してください。', close: '閉じる' },
      lo: { hotelEmpty: 'ຍັງບໍ່ໄດ້ເລືອກໂຮງແຮມ', dateRangeEmpty: 'ຍັງບໍ່ໄດ້ເລືອກວັນເຂົ້າພັກ,ວັນອອກ', roomEmpty: 'ຍັງບໍ່ໄດ້ເລືອກຈຳນວນຫ້ອງ', adultEmpty: 'ຍັງບໍ່ໄດ້ເລືອກຈຳນວນຜູ້ໃຫຍ່', hotel: 'ໂຮງແຮມ', dateRange: 'ວັນພັກອາໄສ', room: 'ຈຳນວນຫ້ອງ', adults: 'ຜູ້ໃຫຍ່', children: 'ເດັກນ້ອຍ', promotion: 'ລະຫັດສ່່ງເສິ້ນ', search: 'ຄົ້ນຫາຫ້ອງພັກ', popupTitle: 'ກระชາน', popupMessage: 'ລະກຸນາຊາไສ່ྃขྃྍູນເປ໇ນເປື່ອງ', close: 'ປິດ' },
      km: { hotelEmpty: 'មិនទាន់ជ្រើសសណ្ឋាគារនៅឡើយ', dateRangeEmpty: 'មិនទាន់ជ្រើសថ្ងៃចូល និងថ្ងៃចេញនៅឡើយ', roomEmpty: 'មិនទាន់ជ្រើសចំនួនបន្ទប់នៅឡើយ', adultEmpty: 'មិនទាន់ជ្រើសចំនួនមនុស្សពេញវ័យនៅឡើយ', hotel: 'សណ្ឋាគារ', dateRange: 'ថ្ងៃស្នាក់នៅ', room: 'ចំនួនបន្ទប់', adults: 'មនុស្សធំ', children: 'ក្មេង', promotion: 'កូដបេបទុល', search: 'ស្វែងរកបន្ទប់', popupTitle: 'សេចក់ថុនបាន', popupMessage: 'សុមបុទបេងបុនតុបសឆវាងប្នែងពុងទុមសបុល', close: 'បិត' }
    };
    if (!['vi', 'en', 'zh', 'ko', 'ja', 'lo', 'km'].includes(lang)) lang = 'vi';

    const t = i18n[lang] || i18n.vi;

    const container = document.querySelector(target);
    if (!container) return;
    const isHotelChain = Array.isArray(hotel) && hotel.length > 1;
    const dateFormat = lang == 'vi' ? 'D [tháng] M YYYY' : 'LL';

    if (!document.getElementById('booking-form-style')) {
      const style = document.createElement('style');
      style.id = 'booking-form-style';
      style.textContent = `
        .booking-form { 
          display: flex; 
          flex-wrap: nowrap; 
          gap: 8px; 
          padding: 15px 10px; 
          background: ${background || '#eee'}; 
          align-items: stretch;
        }
        .booking-form > * { 
          flex: 1; 
          font-size: 14px; 
          min-width: 0;
        }
        .booking-form .hotel-wrapper { 
          position: relative; 
          display: flex;
          flex: 1;
        }
        .booking-form .hotel-wrapper input { 
          font-size: 14px;
          width: 100%;
        }
        .booking-form input, .booking-form select, .booking-form button {
          width: 100%; 
          box-sizing: border-box; 
          height: 43px; 
          text-align: center; 
          border: 1px solid #ccc; 
          border-radius: 4px; 
          color: ${textColor};
          min-width: 0;
        }
        .booking-form input::placeholder, .booking-form select::placeholder, .booking-form button::placeholder { 
          color: ${textColor};
        }
        .booking-form input[name="hotel"] { 
          min-width: 0; 
          width: 100%; 
          text-align: center;
          cursor: pointer;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap;
          padding-left: 5px;
          padding-right: 15px;
        }
        .booking-form .hotel-wrapper #hotelArrow {
          position: absolute; right: 5px; top: 55%; transform: translateY(-50%); pointer-events: none;
        }
        .booking-form .hotel-wrapper .hotel-options {
          position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ccc; border-radius: 6px; max-height: 200px; overflow-y: auto; display: none; z-index: 10;
        }
        .booking-form .hotel-wrapper .hotel-options div {
          padding: 7px 10px; 
          cursor: pointer; 
          border-bottom: 1px solid #ccc; 
          transition: background-color 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .booking-form .hotel-wrapper .hotel-options div:last-child { border-bottom: none; }
        .booking-form .hotel-wrapper .hotel-options div:hover { background-color: #f0f0f0; }
        .booking-form .hotel-wrapper.open .hotel-options { display: block; }
        .booking-form input:focus, .booking-form select:focus, .booking-form button:focus { outline: none; box-shadow: none; }
        .booking-form input.error, .booking-form select.error { border: 2px solid red; }
        .booking-form button { 
          background-color: ${buttonBackground || '#f91e25'}; 
          color: ${buttonTextColor || 'white'}; 
          border: none; 
          cursor: pointer; 
          text-transform: uppercase; 
          padding: 0 6px; 
          white-space: nowrap;
          flex-shrink: 0;
          min-width: 120px;
        }

        .booking-form .floating-label-group { 
          position: relative; 
          display: flex;
          flex: 1;
          min-width: 200px;
        }
        .booking-form .floating-label-group input,
        .booking-form .floating-label-group select { 
          background: transparent;
          width: 100%;
        }
        .booking-form .floating-label-group label.floating-label-text {
          position: absolute; 
          top: -2px; 
          left: 5px;  
          background: ${background || '#eee'}; 
          padding: 0 4px; 
          transform: translateY(-50%); 
          pointer-events: none; 
          transition: 0.2s; 
          z-index: 2; 
          color: ${textColor || '#898484'};
          white-space: nowrap;
          line-height: 1;
        }
        .booking-form .floating-label-group.date-range-group {
          flex: 2;
          min-width: 200px;
        }
        .booking-form .floating-label-group.room-group,
        .booking-form .floating-label-group.adults-group,
        .booking-form .floating-label-group.children-group {
          flex: 0.8;
          min-width: 80px;
        }
        .booking-form .floating-label-group.promo-group { 
          flex: 1.5;
          min-width: 150px;
        }

        /* Tablet styles (768px - 1024px) */
        @media only screen and (max-width: 1024px) and (min-width: 768px) {
          .booking-form { 
            gap: 6px;
            padding: 12px 8px;
          }
          .booking-form .hotel-wrapper{
            flex: 1.8;
            min-width: 180px;
          }
          .booking-form .floating-label-group.date-range-group {
            flex: 1.8;
            min-width: 200px;
          }
          .booking-form .floating-label-group.promo-group { 
            flex: 1.2;
            min-width: 120px;
          }
          .booking-form .floating-label-group.room-group,
          .booking-form .floating-label-group.adults-group,
          .booking-form .floating-label-group.children-group {
            flex: 0.7;
            min-width: 70px;
          }
          .booking-form button {
            min-width: 100px;
            font-size: 13px;
          }
          .booking-form .floating-label-group label.floating-label-text {
            font-size: 12px;
            top: 0;
          }
        }

        /* Mobile styles (up to 767px) */
        @media only screen and (max-width: 767px) {
          .booking-form { 
            display: block;
            gap: 0;
            padding: 15px 10px;
          }
          .booking-form > * { 
            width: 100% !important; 
            margin-bottom: 15px; 
            flex: none;
          }
          .booking-form > *:last-child { margin-bottom: 0; }
          .booking-form > *:first-child { margin-top: 0; }
          .booking-form .floating-label-group.date-range-group,
          .booking-form .floating-label-group.promo-group,
          .booking-form .floating-label-group.room-group,
          .booking-form .floating-label-group.adults-group,
          .booking-form .floating-label-group.children-group {
            min-width: 0; 
            max-width: 100%;
            flex: none;
          }
          .booking-form input, .booking-form select, .booking-form button {
            height: 45px;
            font-size: 16px; /* Prevent zoom on iOS */
          }
          .booking-form .floating-label-group label.floating-label-text {
            font-size: 14px;
          }
        }

        /* Small mobile styles (up to 480px) */
        @media only screen and (max-width: 480px) {
          .booking-form {
            padding: 12px 8px;
          }
          .booking-form > * { 
            margin-bottom: 12px; 
          }
          .booking-form input, .booking-form select, .booking-form button {
            height: 42px;
            font-size: 15px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    container.innerHTML = `
      <div class="booking-form">
        ${isHotelChain ? `
          <div class="hotel-wrapper floating-label-group" id="hotelSelect">
            <input type="text" name="hotel" id="hotelInput" required autocomplete="off" readonly>
            <label for="hotelInput" class="floating-label-text">${t.hotel}</label>
            <div id="hotelArrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-down">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M6 9l6 6l6 -6" />
              </svg>
            </div>
            <div class="hotel-options"></div>
          </div>
        ` : ''}
        <div class="floating-label-group date-range-group">
          <input name="date-range" id="dateRangeInput" required autocomplete="off" readonly>
          <label for="dateRangeInput" class="floating-label-text">${t.dateRange}</label>
        </div>
        <div class="floating-label-group room-group">
          <select name="room" id="roomSelect" required>
            <option value="" disabled selected hidden></option>
          </select>
          <label for="roomSelect" class="floating-label-text">${t.room}</label>
        </div>
        <div class="floating-label-group adults-group">
          <select name="adults" id="adultsSelect" required>
            <option value="" disabled selected hidden></option>
          </select>
          <label for="adultsSelect" class="floating-label-text">${t.adults}</label>
        </div>
        <div class="floating-label-group children-group">
          <select name="children" id="childrenSelect" required>
            <option value="" disabled selected hidden></option>
          </select>
          <label for="childrenSelect" class="floating-label-text">${t.children}</label>
        </div>
        <div class="floating-label-group promo-group">
          <input name="promotion" id="promotionInput" required autocomplete="off">
          <label for="promotionInput" class="floating-label-text">${t.promotion}</label>
        </div>
        <button type="button">${t.search}</button>
      </div>
    `;

    ['room', 'adults', 'children'].forEach(name => {
      const select = container.querySelector(`select[name="${name}"]`);
      if (name === 'children') {
        const opt = document.createElement('option');
        opt.value = 0;
        opt.textContent = 0;
        opt.selected = true;
        select.appendChild(opt);
      }
      for (let i = 1; i <= 10; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        if ((name === 'room' || name === 'adults') && i === 1) {
          opt.selected = true;
        }
        select.appendChild(opt);
      }
    });

    if (isHotelChain) {
      const hotelSelect = container.querySelector(`.hotel-options`);
      const hotelInput = container.querySelector('.hotel-wrapper input[name="hotel"]');
      hotel.forEach((item, idx) => {
        const opt = document.createElement('div');
        opt.dataset.value = item.hotelCode;
        opt.textContent = item.hotelName;
        opt.title = item.hotelName;
        hotelSelect.appendChild(opt);
        if (idx === 0 && hotelInput) {
          hotelInput.value = item.hotelName;
          hotelInput.dataset.code = item.hotelCode;
          hotelInput.title = item.hotelName;
        }
      })
    }

    async function loadScript(src) {
      return new Promise(res => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = res;
        document.head.appendChild(s);
      });
    }

    function loadCSS(href) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }

    (async () => {
      loadCSS('https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css');
      if (typeof window.jQuery === 'undefined') await loadScript('https://code.jquery.com/jquery-3.6.0.min.js');
      await loadScript('https://cdn.jsdelivr.net/momentjs/latest/moment-with-locales.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js');

      const input = container.querySelector('input[name="date-range"]');
      const $ = window.jQuery;

      if (lang === 'zh') lang = 'zh_cn';
      moment.locale(lang);
      const localeData = moment.localeData();

      // Set default start and end dates: today and tomorrow
      const today = moment();
      const tomorrow = moment().add(1, 'days');
      input.value = today.format(dateFormat) + ' ~ ' + tomorrow.format(dateFormat);

      $(input).daterangepicker({
        autoUpdateInput: false,
        minDate: today,
        autoApply: true,
        startDate: today,
        endDate: tomorrow,
        locale: {
          format: dateFormat,
          applyLabel: {
            vi: 'Chọn',
            en: 'Apply',
            ja: '適用',
            zh: '应用',
            ko: '적용',
            lo: 'ເລືອກ',
            km: 'យល់ព្រម'
          }[lang] || 'Apply',
          cancelLabel: {
            vi: 'Hủy',
            en: 'Cancel',
            ja: 'キャンセル',
            zh: '取消',
            ko: '취소',
            lo: 'ຍົກເລີກ',
            km: 'បោះបង់'
          }[lang] || 'Cancel',
          daysOfWeek: localeData.weekdaysMin(),
          monthNames: localeData.months(),
          firstDay: localeData._firstDayOfWeek?.() ?? 1
        }
      });

      // Set input value on initialization
      $(input).data('daterangepicker').setStartDate(today);
      $(input).data('daterangepicker').setEndDate(tomorrow);

      $(input).on('apply.daterangepicker', function (ev, picker) {
        this.value = picker.startDate.format(dateFormat) + ' ~ ' + picker.endDate.format(dateFormat);
        this.classList.remove('error');
      });
      $(input).on('cancel.daterangepicker', function () {
        this.value = '';
      });

      container.querySelector('button').addEventListener('click', () => {
        const getVal = name => container.querySelector(`[name="${name}"]`).value.trim();
        const getCode = name => {
          const el = container.querySelector(`[name="${name}"]`);
          return el && el.dataset && el.dataset.code ? el.dataset.code.trim() : '';
        };
        const setError = name => container.querySelector(`[name="${name}"]`).classList.add('error');
        const clearError = name => container.querySelector(`[name="${name}"]`).classList.remove('error');

        ['date-range', 'room', 'adults', 'hotel'].forEach(name => {
          const el = container.querySelector(`[name="${name}"]`);
          if (!el) return;
          el.addEventListener('change', () => clearError(name));
        });

        let valid = true;
        let errorMessage = [];
        ['hotel', 'date-range', 'room', 'adults'].forEach(name => {
          const el = container.querySelector(`[name="${name}"]`);
          if (!el) return;
          const val = getVal(name);
          if (!val) {
            setError(name);
            valid = false;
            if (name == 'date-range') errorMessage.push(t.dateRangeEmpty);
            if (name == 'room') errorMessage.push(t.roomEmpty);
            if (name == 'adults') errorMessage.push(t.adultEmpty);
          }
          if (name == 'hotel' && !getCode(name)) {
            setError(name);
            valid = false;
            errorMessage.unshift(t.hotelEmpty)
          };
        });

        if (!valid) return alert(errorMessage.join('\n'));
        const [check_in_date, check_out_date] = getVal('date-range').split(' ~ ');
        const check_in = moment(check_in_date, dateFormat).format('YYYY-MM-DD');
        const check_out = moment(check_out_date, dateFormat).format('YYYY-MM-DD');
        const hotel_code = isHotelChain ? getCode('hotel') : hotel[0].hotelCode;
        const params = new URLSearchParams({
          hotel_code,
          check_in,
          check_out,
          num_of_rooms: getVal('room'),
          num_of_adults: getVal('adults'),
          num_of_children: getVal('children'),
          promo_code: getVal('promotion'),
          lang
        });
        window.location.href = `${path}?${params.toString()}`;
      });

      if (isHotelChain) {
        const wrapper = document.getElementById('hotelSelect');
        const hotel = wrapper.querySelector('input[name="hotel"]');
        const arrow = document.getElementById('hotelArrow');
        const options = wrapper.querySelector('.hotel-options');

        $(hotel).on('click', () => {
          const isOpen = wrapper.classList.toggle('open');
          arrow.innerHTML = isOpen ?
            `<svg  xmlns="http://www.w3.org/2000/svg"  width="16"  height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M6 15l6 -6l6 6" />
            </svg>` :
            `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-down">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M6 9l6 6l6 -6" />
            </svg>`;
        })

        options.querySelectorAll('div').forEach(option => {
          $(option).on('click', () => {
            hotel.value = option.textContent;
            hotel.dataset.code = option.dataset.value;
            hotel.title = option.textContent;
            wrapper.classList.remove('open');
            arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-down">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M6 9l6 6l6 -6" />
                </svg>`;
          })
        });
        document.addEventListener('click', (e) => {
          if (!wrapper.contains(e.target)) {
            wrapper.classList.remove('open');
            arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-down">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M6 9l6 6l6 -6" />
            </svg>`;
          }
        });
      }
    })();
  };

  /**
   * @param {Object} config - Configuration object
   * @param {string} config.target - CSS selector for target element
   * @param {boolean} config.scrollToTop - Enable scroll to top button
   * @param {number} config.marginTop - Cấu hình nếu khách sạn fix header thì sẽ tính toán chiều cao và nhập vào đây
   */
  window.initBookingEngine = function (config = {}) {
    const {
      target,
      scrollToTop = false,
      marginTop = 0
    } = config;

    if (!target) {
      return null;
    }

    const targetElement = document.querySelector(target);
    if (!targetElement) {
      return null;
    }

    class BookingEngine {
      constructor() {
        this.target = targetElement;
        this.origin = '*';
        this.throttleMs = 100;
        this.scrollThreshold = 500;
        this.ezBeUrl = DEFAULT_EZ_BE_URL;
        this.marginTop = marginTop;
        this.state = {
          isInitialized: false,
          isLoading: true,
          firstLoading: true,
          hasSentHide: false,
          scrollY: 0,
          initialOffsetTop: 0,
          scrollTimeout: null,
          prevHeight: 0,
          isDisableScroller: false,
          isScrolling: false,
          lockScrollHandler: null,
          immediateLockHandler: null,
          isScrollFixed: false,
          reloadPosition: false
        };

        this.elements = {
          iframe: null,
          loadingContainer: null,
          scrollToTopBtn: null,
          parentUrl: null,
          params: null,
          pathName: null,
          imageUrl: '',
        };

        this.eventListeners = [];
        this.init();

        // Thêm event listener để theo dõi trạng thái scroll
        this.setupScrollListener();

        this.handleWindowScroll = () => {
          if (this.state.isDisableScroller) {
            const rect = this.elements.iframe.getBoundingClientRect();
            const iframeTop = rect.top + window.scrollY;
            const center = iframeTop - (window.innerHeight / 2) + (this.elements.iframe.offsetHeight / 2) - (this.marginTop / 2);
            if (typeof window.scrollTo === 'function') {
              try {
                window.scrollTo({ top: center });
              } catch (e) {
                window.scrollTo(0, center);
              }
            } else {
              window.scrollTo(0, center);
            }
          }
        };
      }

      async init() {
        try {
          const config = await loadConfig();
          this.ezBeUrl = config.EZ_BE_URL;
          this.elements.imageUrl = config.IMAGE_404_URL;
          this.validateUrlParams();
          this.createLoadingState();
          this.createIframe();
          this.setupMessageListener();
          this.setupScrollToTop();
          this.injectIframe();
          this.state.isInitialized = true;
        } catch (error) {
          this.showError(`Xảy ra lỗi trong quá trình xử lý dữ liệu`, error.message);
          this.cleanup();
        }
      }

      validateUrlParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('call_back') && params.get('call_back') == '1' && params.get('hotel_code')) {
          this.elements.pathName = 'BePaymentDetail';
        } else {
          this.elements.pathName = 'BeDetailHotel';
          const requiredParams = ['hotel_code', 'check_in', 'check_out', 'num_of_rooms', 'num_of_adults'];
          for (const param of requiredParams) {
            if (!params.get(param)) {
              throw new Error(`Missing required parameter: ${param}`);
            }
          }
        }

        params.set('mode', 'embed');
        this.elements.params = params;
        const currentUrl = new URL(window.location.href);
        const baseUrl = currentUrl.origin + currentUrl.pathname;
        const url = new URL(baseUrl);
        url.searchParams.set('hotel_code', params.get('hotel_code'));
        url.searchParams.set('call_back', '1');
        url.searchParams.set('check_in', params.get('check_in'));
        url.searchParams.set('check_out', params.get('check_out'));
        url.searchParams.set('num_of_rooms', params.get('num_of_rooms'));
        url.searchParams.set('num_of_adults', params.get('num_of_adults'));
        url.searchParams.set('num_of_children', params.get('num_of_children'));
        url.searchParams.set('promo_code', params.get('promo_code'));
        url.searchParams.set('lang', this.validateLanguage(params.get('lang')));
        this.elements.parentUrl = url.toString();

        const urlParams = new URLSearchParams({
          hotel_code: params.get('hotel_code'),
          check_in: params.get('check_in'),
          check_out: params.get('check_out'),
          num_of_rooms: params.get('num_of_rooms'),
          num_of_adults: params.get('num_of_adults'),
          num_of_children: params.get('num_of_children'),
          promo_code: params.get('promo_code'),
          lang: this.validateLanguage(params.get('lang'))
        });
        const cleanUrl = `${window.location.origin + window.location.pathname}?${urlParams.toString()}`;
        // Xóa toàn bộ query params nếu thanh toán online trên URL trình duyệt
        window.history.replaceState({}, document.title, cleanUrl);
      }

      createLoadingState() {
        const existingStyle = document.getElementById('booking-engine-loading');
        if (existingStyle) existingStyle.remove();

        const style = document.createElement('style');
        style.id = 'booking-engine-loading';
        style.textContent = `
          .booking-engine-loading {
            min-height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f9f9f9;
            border-radius: 8px;
          }
          .booking-engine-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e3e3e3;
            border-top-color: #3498db;
            border-radius: 50%;
            animation: booking-engine-spin 1s linear infinite;
          }
          .booking-engine-fixed-scroll {
            position: fixed;
            width: 100%;
          }
          .booking-engine-fixed-scroll-mobile {
            width: 100%;
            height: 100vh;
          }
          @keyframes booking-engine-spin { 
            to { transform: rotate(360deg); } 
          }
          .booking-engine-scroll-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 44px;
            height: 44px;
            background: #4671a4;
            color: #fff;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: background 0.3s ease;
          }
          .booking-engine-scroll-btn:hover {
            background: #5a85bb;
          }
        `;
        document.head.appendChild(style);

        this.elements.loadingContainer = document.createElement('div');
        this.elements.loadingContainer.className = 'booking-engine-loading';

        const spinner = document.createElement('div');
        spinner.className = 'booking-engine-spinner';
        this.elements.loadingContainer.appendChild(spinner);

        this.target.appendChild(this.elements.loadingContainer);
      }

      removeLoadingState() {
        if (this.elements.loadingContainer && this.elements.loadingContainer.parentNode) {
          this.elements.loadingContainer.parentNode.removeChild(this.elements.loadingContainer);
          this.state.isLoading = false;
        }
      }

      async showError(message, logs) {
        this.removeLoadingState();
        const errorContainer = document.createElement('div');
        errorContainer.className = 'booking-engine-error-message';

        // Hàm kiểm tra URL hợp lệ
        function isValidUrl(str) {
          try {
            new URL(str);
            return true;
          } catch (e) {
            return false;
          }
        }

        //lấy ảnh lỗi.
        if (this.elements.imageUrl && isValidUrl(this.elements.imageUrl)) {
          errorContainer.style.cssText = `
            width: 100%;
            max-width: 500px;
            text-align: center;
            padding: 0;
            margin: 0 auto;
          `;
          const img = document.createElement('img');
          img.src = this.elements.imageUrl;
          img.style.width = '100%';
          img.alt = message || 'Error image';
          errorContainer.appendChild(img);
        } else {
          errorContainer.style.cssText = `
            padding: 20px;
            background-color: #fff;
            text-align: center;
            margin: 10px 0;
          `;
          errorContainer.style.color = '#ff0000';
          errorContainer.style.fontSize = '16px';
          errorContainer.style.fontWeight = 'bold';
          errorContainer.textContent = message;
        }

        if (this.target) {
          this.target.innerHTML = '';
          this.target.appendChild(errorContainer);
        } else {
          document.body.appendChild(errorContainer);
        }
        console.log(logs);
      }

      removeErrorMessages() {
        const errors = (this.target || document.body).querySelectorAll('.booking-engine-error-message');
        errors.forEach(el => el.remove());
      }

      createIframe() {
        const iframeUrl = `${this.ezBeUrl}/hotel/${this.elements.pathName}?${new URLSearchParams(this.elements.params)}`;
        this.elements.iframe = document.createElement('iframe');
        this.elements.iframe.src = iframeUrl;
        this.elements.iframe.style.cssText = `
          width: 100%;
          border: none;
          display: block;
          min-height: 0px;
        `;
        this.elements.iframe.setAttribute('scrolling', 'no');
        this.elements.iframe.setAttribute('id', 'booking-engine-iframe');
        this.elements.iframe.setAttribute('title', 'Booking Engine');
      }

      validateLanguage(lang) {
        const supportedLanguages = ['vi', 'en', 'zh', 'ko', 'ja', 'lo', 'km'];
        return supportedLanguages.includes(lang) ? lang : 'vi';
      }

      setupMessageListener() {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        const messageHandler = (event) => {
          if (this.origin !== '*' && event.origin !== this.origin) {
            return;
          }
          const data = event.data;
          if (!data || typeof data !== 'object') return;
          this.handleMessage(data, scrollbarWidth);
        };

        window.addEventListener('message', messageHandler);
        this.eventListeners.push({ type: 'message', handler: messageHandler, target: window });
      }

      handleMessage(data, scrollbarWidth) {
        switch (data.type) {
          case 'iframeLoadingStart':
            this.postMessageToIframe({ type: 'parentUrl', parentUrl: this.elements.parentUrl, parentMarginTop: this.marginTop });
            this.state.firstLoading = false;
            break;

          case 'setHeight':
            if (
              data.type === 'setHeight' &&
              typeof data.height === 'number' &&
              data.height > 0 &&
              data.height !== this.state.prevHeight &&
              !this.state.isDisableScroller
            ) {
              this.state.prevHeight = data.height;
              this.removeLoadingState();
              this.elements.iframe.style.height = `${data.resize === false ? window.innerHeight : data.height}px`;
              document.body.classList.remove('booking-engine-fixed-scroll');
              document.body.classList.remove('booking-engine-fixed-scroll-mobile');
              this.restoreScroll();
              document.body.style.removeProperty('touchAction');
              document.body.style.removeProperty('top');

              window.removeEventListener('scroll', this.handleWindowScroll);
              if (data.resize === false && !this.state.firstLoading) {
                requestAnimationFrame(() => {
                  const rect = this.elements.iframe.getBoundingClientRect();
                  const scrollTop = window.scrollY + rect.top - this.marginTop;
                  window.scrollTo({ top: scrollTop, behavior: 'smooth' });
                });
              }
              if (this.state.reloadPosition) {
                this.sendScrollToIframe();
                this.state.reloadPosition = false;
              }
              this.sendParentInfo();
            }
            break;

          case 'disableScroll':
            this.state.isDisableScroller = true;
            this.handleDisableScroll(data, scrollbarWidth);
            break;

          case 'enableScroll':
            this.state.isDisableScroller = false;
            this.handleEnableScroll(data);
            break;

          case 'showCart':
            this.state.hasSentHide = true;
            this.sendImmediateEvent('hideFixElement');
            this.sendScrollToIframe();
            break;
          case 'paymentGate':
            if (data.linkUrl) {
              window.location.href = data.linkUrl;
            }
            break;
          case 'reloadPosition':
            this.state.reloadPosition = true;
          break;
        }
      }

      handleDisableScroll(data, scrollbarWidth) {
        document.body.style.setProperty('touchAction', 'none');

        const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
        let offset;
        if (window.innerWidth <= 768) {
          offset = 10 * remInPx;
        } else {
          offset = 5 * remInPx;
        }
        const maxHeight = window.innerHeight - offset;
        this.postMessageToIframe({ type: 'maxHeightDialog', maxHeight });

        if (data.action === 'hideScrollOnly') {
          this.preventScroll();
          return;
        }

        const doFixScroll = () => {
          this.state.scrollY = window.scrollY;
          const rect = this.elements.iframe.getBoundingClientRect();
          const iframeTop = rect.top + window.scrollY;
          const center = iframeTop - (window.innerHeight / 2) + (this.elements.iframe.offsetHeight / 2) - (this.marginTop / 2);

          if (typeof window.scrollTo === 'function') {
            try {
              window.scrollTo({ top: center });
            } catch (e) {
              window.scrollTo(0, center);
            }
          } else {
            window.scrollTo(0, center);
          }

          requestAnimationFrame(() => {
            this.preventScroll();

            if (data.viewPort == 'PC') {
              document.body.classList.add('booking-engine-fixed-scroll');
            } else {
              document.body.classList.add('booking-engine-fixed-scroll-mobile');
            }

            document.body.style.setProperty('top', `-${center}px`, 'important');
            window.addEventListener('scroll', this.handleWindowScroll);
          });
        };

        if (this.state.isScrolling) {
          // Đợi đến khi scroll dừng mới fix scroll
          const waitForScrollEnd = () => {
            if (!this.state.isScrolling) {
              doFixScroll();
            } else {
              setTimeout(waitForScrollEnd, 50);
            }
          };
          waitForScrollEnd();
        } else {
          doFixScroll();
        }
      }

      preventScroll() {
        const lockScrollPosition = () => {
          const rect = this.elements.iframe.getBoundingClientRect();
          const iframeTop = rect.top + window.scrollY;
          const center = iframeTop - (window.innerHeight / 2) + (this.elements.iframe.offsetHeight / 2) - (this.marginTop / 2);

          if (window.scrollY !== center) {
            requestAnimationFrame(() => {
              window.scrollTo(0, center);
            });
          }
        };

        this.state.lockScrollHandler = lockScrollPosition;
        window.addEventListener('scroll', lockScrollPosition, { passive: false });

        const immediateLockScroll = (e) => {
          const rect = this.elements.iframe.getBoundingClientRect();
          const iframeTop = rect.top + window.scrollY;
          const center = iframeTop - (window.innerHeight / 2) + (this.elements.iframe.offsetHeight / 2) - (this.marginTop / 2);

          if (window.scrollY !== center) {
            requestAnimationFrame(() => {
              window.scrollTo(0, center);
            });
          }
        };

        this.state.immediateLockHandler = immediateLockScroll;
        document.addEventListener('wheel', immediateLockScroll, { passive: true });
        document.addEventListener('touchmove', immediateLockScroll, { passive: true });
        this.state.isScrollFixed = true;
      }

      restoreScroll() {
        if (this.state.lockScrollHandler) {
          window.removeEventListener('scroll', this.state.lockScrollHandler);
          this.state.lockScrollHandler = null;
        }

        if (this.state.immediateLockHandler) {
          document.removeEventListener('wheel', this.state.immediateLockHandler);
          document.removeEventListener('touchmove', this.state.immediateLockHandler);
          this.state.immediateLockHandler = null;
        }

        document.body.classList.remove('prevent-scroll');
        this.state.isScrollFixed = false;
      }

      handleEnableScroll(data) {
        this.restoreScroll();
        document.body.style.touchAction = '';

        if (data.viewPort == 'PC') {
          document.body.classList.remove('booking-engine-fixed-scroll');
        } else {
          document.body.classList.remove('booking-engine-fixed-scroll-mobile');
        }

        if (data.action === 'hideScrollOnly') {
          return;
        }

        requestAnimationFrame(() => {
          document.body.style.top = '';
          if (this.state.scrollY > 0) {
            window.scrollTo(0, this.state.scrollY);
          }
          window.removeEventListener('scroll', this.handleWindowScroll);
        });
      }

      postMessageToIframe(message) {
        if (this.elements.iframe && this.elements.iframe.contentWindow) {
          const iframeRect = this.elements.iframe.getBoundingClientRect();
          const distanceFromTopToBottomOfFrame = iframeRect.top + this.elements.iframe.offsetHeight;
          const maxHeight = Math.min(window.innerHeight, distanceFromTopToBottomOfFrame);
          message.browserHeight = maxHeight - this.marginTop;
          this.elements.iframe.contentWindow.postMessage(message, this.origin);
        }
      }

      sendImmediateEvent(type, data = {}) {
        this.postMessageToIframe({ type, ...data });
      }

      setupScrollToTop() {
        if (!scrollToTop) return;

        if (document.getElementById('booking-engine-scroll-btn')) return;

        this.elements.scrollToTopBtn = document.createElement('button');
        this.elements.scrollToTopBtn.id = 'booking-engine-scroll-btn';
        this.elements.scrollToTopBtn.className = 'booking-engine-scroll-btn';
        this.elements.scrollToTopBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="white"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 5l0 14" />
            <path d="M18 11l-6 -6" />
            <path d="M6 11l6 -6" />
          </svg>
        `;

        const scrollHandler = () => {
          if (window.scrollY > this.scrollThreshold) {
            this.elements.scrollToTopBtn.style.display = 'flex';
          } else {
            this.elements.scrollToTopBtn.style.display = 'none';
          }
        };

        const clickHandler = () => {
          this.smoothScrollToTop(800);
        };

        const resizeHandler = () => {
          this.postMessageToIframe({ type: 'parentResize' });
        }

        this.elements.scrollToTopBtn.addEventListener('click', clickHandler);
        window.addEventListener('scroll', scrollHandler);
        window.addEventListener('resize', resizeHandler);

        this.eventListeners.push(
          { type: 'click', handler: clickHandler, target: this.elements.scrollToTopBtn },
          { type: 'scroll', handler: scrollHandler, target: window },
          { type: 'resize', handler: resizeHandler, target: window }
        );

        document.body.appendChild(this.elements.scrollToTopBtn);
      }

      smoothScrollToTop(duration = 800) {
        const start = window.scrollY;
        const startTime = performance.now();

        const scrollStep = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          window.scrollTo(0, start * (1 - ease));

          if (progress < 1) {
            requestAnimationFrame(scrollStep);
          }
        };

        requestAnimationFrame(scrollStep);
      }

      injectIframe() {
        if (this.target) {
          this.target.appendChild(this.elements.iframe);
          const rect = this.target.getBoundingClientRect();
          this.state.initialOffsetTop = Math.ceil(rect.top + window.scrollY);
        } else {
          document.body.appendChild(this.elements.iframe);
        }

        this.elements.iframe.onload = () => {
          const errorEl = this.target.querySelector('.booking-engine-error');
          if (errorEl) errorEl.remove();

          let ticking = false;
          const optimizedScrollHandler = () => {
            if (!ticking) {
              requestAnimationFrame(() => {
                this.sendScrollToIframe();
                ticking = false;
              });
              ticking = true;
            }
          };

          window.addEventListener('scroll', optimizedScrollHandler);
          this.eventListeners.push({ type: 'scroll', handler: optimizedScrollHandler, target: window });
        };

        this.elements.iframe.onerror = () => {
          this.showError('Xảy ra lỗi trong quá trình xử lý dữ liệu', 'onerror');
        };

        setTimeout(() => {
          if (this.state.isLoading) {
            this.showError('Xảy ra lỗi trong quá trình xử lý dữ liệu', 'timeout');
          }
        }, 60000);
      }

      sendScrollToIframe() {
        if (this.state.isScrollFixed) {
          return;
        }
        const distance = Math.ceil(window.scrollY - this.state.initialOffsetTop);
        const iframeBottom = this.state.initialOffsetTop + this.elements.iframe.offsetHeight;
        const viewportBottom = window.scrollY + window.innerHeight;
        const bottomGap = viewportBottom - iframeBottom;

        if (!this.state.hasSentHide) {
          this.state.hasSentHide = true;
          this.postMessageToIframe({ type: 'hideFixElement' });
        }

        if (this.state.scrollTimeout) {
          clearTimeout(this.state.scrollTimeout);
        }

        this.state.scrollTimeout = setTimeout(() => {
          if (distance > 0 || bottomGap < 0) {
            this.postMessageToIframe({
              type: 'scrollFromParent',
              scrollY: distance > 0 ? distance + this.marginTop : distance + this.marginTop > 0 ? distance + this.marginTop : 0,
              viewPort: bottomGap > 0 ? 0 : bottomGap
            });
          }
          this.state.hasSentHide = false;
        }, 300);
      }

      sendParentInfo() {
        const distance = Math.ceil(window.scrollY - this.state.initialOffsetTop);
        const iframeBottom = this.state.initialOffsetTop + this.elements.iframe.offsetHeight;
        const viewportBottom = window.scrollY + window.innerHeight;
        const bottomGap = viewportBottom - iframeBottom;
        const maxHeight = window.innerHeight;
        const rect = this.elements.iframe.getBoundingClientRect();
        const iframeTop = rect.top + window.scrollY;
        const center = iframeTop - (window.innerHeight / 2) + (this.elements.iframe.offsetHeight / 2) - (this.marginTop / 2);

        if (distance > 0 || bottomGap < 0) {
          this.postMessageToIframe({
            type: 'parentInfo',
            scrollY: distance > 0 ? distance + this.marginTop : distance + this.marginTop > 0 ? distance + this.marginTop : 0,
            viewPort: bottomGap > 0 ? 0 : bottomGap,
            maxHeight: maxHeight,
            center: center
          });
        }
      }

      throttle(func, limit) {
        let inThrottle;
        return function () {
          const args = arguments;
          const context = this;
          if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
          }
        };
      }

      setupScrollListener() {
        const scrollHandler = () => {
          this.state.isScrolling = true;

          if (this.scrollEndTimeout) {
            clearTimeout(this.scrollEndTimeout);
          }

          this.scrollEndTimeout = setTimeout(() => {
            this.state.isScrolling = false;
          }, 150);
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
        this.eventListeners.push({ type: 'scroll', handler: scrollHandler, target: window });
      }

      cleanup() {
        if (this.state.scrollTimeout) {
          clearTimeout(this.state.scrollTimeout);
        }

        if (this.scrollEndTimeout) {
          clearTimeout(this.scrollEndTimeout);
        }

        this.eventListeners.forEach(({ type, handler, target }) => {
          target.removeEventListener(type, handler);
        });
        this.eventListeners = [];

        if (this.elements.scrollToTopBtn && this.elements.scrollToTopBtn.parentNode) {
          this.elements.scrollToTopBtn.parentNode.removeChild(this.elements.scrollToTopBtn);
        }

        this.restoreScroll();
        document.body.style.touchAction = '';
        document.body.style.removeProperty('top');
        document.body.classList.remove('booking-engine-fixed-scroll');
        document.body.classList.remove('booking-engine-fixed-scroll-mobile');
        const style = document.getElementById('booking-engine-loading');
        if (style) style.remove();

        this.state.isInitialized = false;
      }

      destroy() {
        this.cleanup();
      }

      getState() {
        return { ...this.state };
      }
    }

    const instance = new BookingEngine();
    return {
      destroy: () => instance.destroy(),
      getState: () => instance.getState(),
      instance
    };
  };
})();