/**
 * Vietnamese language utilities for Geometry Dash bot
 */

const vietnamese = {
    /**
     * Get Vietnamese difficulty name
     */
    getDifficultyName(difficulty) {
        const difficultyMap = {
            0: 'Không xác định',
            10: 'Dễ',
            20: 'Bình thường', 
            30: 'Khó',
            40: 'Khó hơn',
            50: 'Điên cuồng'
        };

        // Handle demon difficulties
        if (difficulty >= 50) {
            return 'Demon';
        }

        return difficultyMap[difficulty] || 'Không xác định';
    },

    /**
     * Get difficulty icon/emoji
     */
    getDifficultyIcon(difficulty) {
        const iconMap = {
            0: '❓',
            10: '🟢',  // Easy - Green
            20: '🟡',  // Normal - Yellow
            30: '🟠',  // Hard - Orange
            40: '🔴',  // Harder - Red
            50: '🟣'   // Insane/Demon - Purple
        };

        if (difficulty >= 50) {
            return '👹'; // Demon
        }

        return iconMap[difficulty] || '❓';
    },

    /**
     * Get Vietnamese length name
     */
    getLengthName(length) {
        const lengthMap = {
            0: 'Rất ngắn',
            1: 'Ngắn',
            2: 'Trung bình',
            3: 'Dài',
            4: 'Rất dài'
        };

        return lengthMap[length] || 'Không rõ';
    },

    /**
     * Format numbers in Vietnamese style
     */
    formatNumber(number) {
        if (typeof number !== 'number') return '0';
        
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        }
        
        return number.toLocaleString('vi-VN');
    },

    /**
     * Get status messages in Vietnamese
     */
    getStatusMessage(type) {
        const messages = {
            connecting: '🔄 Đang kết nối...',
            connected: '✅ Đã kết nối thành công!',
            error: '❌ Đã xảy ra lỗi',
            loading: '⏳ Đang tải...',
            success: '✅ Thành công!',
            notFound: '❌ Không tìm thấy',
            cooldown: '⏰ Vui lòng chờ một chút trước khi sử dụng lệnh này lại'
        };

        return messages[type] || messages.error;
    },

    /**
     * Common Vietnamese phrases for the bot
     */
    phrases: {
        welcome: 'Chào mừng đến với GDVN Bot!',
        help: 'Cần trợ giúp? Sử dụng lệnh /help',
        invalidCommand: 'Lệnh không hợp lệ. Sử dụng /help để xem danh sách lệnh.',
        permissionDenied: 'Bạn không có quyền sử dụng lệnh này.',
        serverError: 'Lỗi máy chủ. Vui lòng thử lại sau.',
        maintenance: 'Bot đang được bảo trì. Vui lòng quay lại sau.',
        rateLimit: 'Bạn đang sử dụng lệnh quá nhanh. Vui lòng chờ một chút.'
    },

    /**
     * Time formatting in Vietnamese
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Validate Vietnamese text input
     */
    isValidVietnamese(text) {
        // Allow Vietnamese characters, numbers, and common symbols
        const vietnameseRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ0-9\s\-_.,!?'"()[\]{}]*$/;
        return vietnameseRegex.test(text);
    }
};

module.exports = vietnamese;
