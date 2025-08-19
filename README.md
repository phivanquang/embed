## Một số chú ý:
* File nhúng và file cấu hình phải luôn luôn cùng cấp..
* folder demo và plugins phải cùng cấp.
* việc cấu hình thêm các môi trường để test thì đường dẫn sẽ luôn nằm trước /demo/.

  ví dụ: <br>
  https://app.oneinventory.com/booking-engine/demo/index.html<br>
  https://app.oneinventory.com/booking-engine/dev/demo/index.html<br>
  https://app.oneinventory.com/booking-engine/uat/demo/index.html<br>

* hiện tại đang set file cấu hình là configs.json và file nhúng là ez-embed.   js<br> nếu như các file có thay đổi lại tên thì sẽ phải điều chỉnh lại tên đã đặt biến trước đó.<br>
  trong file nhúng: <br>
  const EMBED_SCRIPT_NAME = 'ezbe-embed.js'; // Tên file nhúng
  const CONFIGS_NAME = 'configs.json'; // Tên file configs đặt biến<br>
    trong file html: <br>
    script.src = `${u.origin}${u.pathname.replace(/\/demo\/.*$/, '/plugins/ezbe-embed.js')}`;

    * cấu trúc thư mục

  index.html<br>
  room-list.html<br>
  images<br>
    404.png<br>
    favicon.ico<br>
    hotel_banner_demo.jpg<br>
  plugins<br>
    configs.json<br>
    ezbe-embed.js<br>
  readme.md<br>

