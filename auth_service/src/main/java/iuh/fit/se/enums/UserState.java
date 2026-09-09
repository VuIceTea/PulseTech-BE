package iuh.fit.se.enums;

public enum UserState {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    BANNED("Banned");

    private String state;

    // Constructor để khởi tạo giá trị cho enum
    UserState(String state) {
        this.state = state;
    }

    // Phương thức để trả về giá trị String của trạng thái
    public String getState() {
        return this.state;
    }

}
