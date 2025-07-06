# 🔍 Cypress Test Suite - POS Website Comprehensive Testing

## 📋 Mô tả

Bộ test Cypress toàn diện để kiểm tra trang web POS tại https://pos-frontend-e1q.pages.dev

### ✨ Tính năng chính

- **Console Error Tracking**: Theo dõi tất cả lỗi console (error, warning)
- **Button & Link Testing**: Tự động click tất cả button và link
- **Form Testing**: Kiểm tra input, select, textarea
- **API Monitoring**: Theo dõi các request API và response
- **Structure Validation**: Kiểm tra cấu trúc HTML và các component
- **POS Page Testing**: Kiểm tra riêng trang POS
- **Comprehensive Reporting**: Báo cáo chi tiết kết quả test

## 🚀 Cài đặt

### 1. Cài đặt Node.js và npm
```bash
# Kiểm tra version (cần Node.js >= 16)
node --version
npm --version
```

### 2. Cài đặt Cypress
```bash
# Cài đặt Cypress
npm install cypress --save-dev

# Hoặc cài đặt global
npm install -g cypress
```

### 3. Cài đặt dependencies
```bash
npm install
```

## 🏃‍♂️ Chạy Tests

### Chạy với GUI (Recommended)
```bash
# Mở Cypress Test Runner
npm run cy:open

# Hoặc
npx cypress open
```

### Chạy Headless (Command Line)
```bash
# Chạy tất cả tests
npm run cy:run

# Chạy với Chrome
npm run cy:run:chrome

# Chạy với Firefox
npm run cy:run:firefox

# Chạy headless
npm run cy:run:headless
```

### Chạy test cụ thể
```bash
# Chạy file test cụ thể
npx cypress run --spec "cypress/e2e/pos-website-comprehensive-test.cy.js"

# Chạy với browser cụ thể
npx cypress run --spec "cypress/e2e/pos-website-comprehensive-test.cy.js" --browser chrome
```

## 📊 Kết quả Test

### Test Reports
- **Console Logs**: Hiển thị trong Cypress Test Runner
- **Screenshots**: Tự động chụp khi test fail
- **Videos**: Ghi lại toàn bộ quá trình test
- **JSON Results**: Lưu trong `cypress/results/`

### Test Coverage
Test suite bao gồm 8 test cases chính:

1. **🏠 Page Load & Console Errors**
   - Kiểm tra trang load thành công
   - Theo dõi console errors/warnings
   - Phát hiện critical errors

2. **🔗 Navigation Links**
   - Test tất cả menu items
   - Kiểm tra navigation functionality
   - Verify page transitions

3. **🖱️ Button Interactions**
   - Click tất cả buttons
   - Test modal/drawer interactions
   - Auto-close popups

4. **📝 Form & Input Testing**
   - Test input fields (text, number, date, etc.)
   - Test select dropdowns
   - Test textareas
   - Form submission testing

5. **🌐 API Request Monitoring**
   - Intercept all API calls
   - Monitor response status codes
   - Log API errors

6. **🏗️ Page Structure**
   - Verify HTML structure
   - Check Ant Design components
   - Validate accessibility elements

7. **🔍 POS Page Specific**
   - Test POS page functionality
   - Check for white screen issues
   - Verify POS-specific elements

8. **📊 Final Report**
   - Summary of all test results
   - Error categorization
   - Performance metrics

## 🛠️ Cấu hình

### Cypress Configuration (`cypress.config.js`)
```javascript
{
  baseUrl: 'https://pos-frontend-e1q.pages.dev',
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 30000
}
```

### Custom Commands
- `cy.safeClick()` - Click an toàn
- `cy.safeType()` - Type an toàn
- `cy.closeModals()` - Đóng modals/drawers
- `cy.waitForLoad()` - Chờ page load
- `cy.logResult()` - Log test results

## 🐛 Troubleshooting

### Common Issues

1. **Cypress không khởi động được**
   ```bash
   # Clear cache
   npx cypress cache clear
   npx cypress cache path
   
   # Reinstall
   npm uninstall cypress
   npm install cypress --save-dev
   ```

2. **Test bị timeout**
   - Tăng timeout trong `cypress.config.js`
   - Kiểm tra kết nối internet
   - Kiểm tra trang web có hoạt động không

3. **Element không tìm thấy**
   - Kiểm tra selector
   - Thêm wait time
   - Sử dụng `cy.get().should('be.visible')`

4. **API intercept không hoạt động**
   - Kiểm tra network tab
   - Verify API endpoints
   - Check CORS settings

### Debug Mode
```bash
# Chạy với debug mode
DEBUG=cypress:* npx cypress run

# Chạy với verbose logging
npx cypress run --reporter spec --verbose
```

## 📁 Cấu trúc Files

```
cypress/
├── e2e/
│   └── pos-website-comprehensive-test.cy.js  # Main test file
├── support/
│   ├── commands.js                          # Custom commands
│   └── e2e.js                              # Support configuration
├── fixtures/                               # Test data
├── screenshots/                            # Screenshots on failure
├── videos/                                 # Test videos
└── results/                               # Test results (JSON)
```

## 🔧 Tùy chỉnh Tests

### Thêm test case mới
```javascript
it('🆕 New test case', () => {
  cy.log('Testing new functionality');
  // Test logic here
});
```

### Thêm custom command
```javascript
// cypress/support/commands.js
Cypress.Commands.add('customCommand', (param) => {
  // Command logic
});
```

### Thay đổi target URL
```javascript
// cypress.config.js
baseUrl: 'https://your-new-url.com'
```

## 📈 Performance Tips

1. **Parallel Testing**: Chạy tests song song
2. **Selective Testing**: Chỉ chạy tests cần thiết
3. **Headless Mode**: Sử dụng cho CI/CD
4. **Video Recording**: Tắt nếu không cần thiết

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

Nếu có vấn đề hoặc cần hỗ trợ:
- Tạo issue trên GitHub
- Kiểm tra Cypress documentation
- Xem logs chi tiết trong `cypress/results/`

---

**Happy Testing! 🎉** 