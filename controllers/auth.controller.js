const User = require("../models/user.model.js");
const httpStatus = require("http-status");
const generateToken = require("../common/generateToken.js");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Thiếu thông tin tài khoản hoặc mật khẩu",
        code: httpStatus.BAD_REQUEST,
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Email không hợp lệ",
        code: httpStatus.BAD_REQUEST,
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message:
          "Mật khẩu không đúng định dạng, mật khẩu phải ít nhất 8 ký tự gồm chữ số, chữ hoa, chữ thường và ký tự đặc biệt",
        code: httpStatus.BAD_REQUEST,
      });
    }

    const isValidUser = await User.findOne({ email });
    if (!isValidUser) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Email chưa được đăng ký",
        code: httpStatus.BAD_REQUEST,
      });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      isValidUser.password
    );
    if (!isValidPassword) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Thông tin tài khoản không chính xác",
        code: httpStatus.BAD_REQUEST,
      });
    }

    const data = {
      _id: isValidUser._id,
      email: isValidUser.email,
      name: isValidUser.name,
      role: isValidUser.role,
      gender: isValidUser.gender,
    };

    const responseData = await User.findOne({ email }).select("-password -__v");

    const tokenName = "ACCESSTOKEN";

    const accessToken = generateToken({
      data,
      tokenName,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true, // Chỉ truy cập qua HTTP, ngăn JS đọc token
      secure: true, // Sử dụng HTTPS
      sameSite: "strict", // Ngăn gửi token qua các trang khác
      maxAge: 24 * 60 * 60 * 1000, // Cookie tồn tại trong 1 ngày
    });

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Đăng nhập thành công",
      code: httpStatus.OK,
      data: {
        responseData,
      },
    });
  } catch (err) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Có lỗi xảy ra trong quá trình xử lý dữ liệu",
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Thiếu thông tin đăng ký",
        code: httpStatus.BAD_REQUEST,
      });
    }

    // const userNameRegex = /^[a-zA-Z]{3,}$/;
    // if (!userNameRegex.test(username)) {
    //   return res.status(httpStatus.BAD_REQUEST).json({
    //     success: false,
    //     message: "Trong tên chỉ bao gồm chữ cái và khoảng trắng",
    //     code: httpStatus.BAD_REQUEST,
    //   });
    // }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Email không hợp lệ",
        code: httpStatus.BAD_REQUEST,
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message:
          "Mật khẩu không đúng định dạng, mật khẩu phải ít nhất 8 ký tự gồm chữ số, chữ hoa, chữ thường và ký tự đặc biệt",
        code: httpStatus.BAD_REQUEST,
      });
    }

    const isExistUser = await User.findOne({ email });

    if (isExistUser) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Email đã được đăng ký cho tài khoản khác",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const accessToken = generateToken({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      tokenName: "ACCESSTOKEN",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const refreshToken = generateToken({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      tokenName: "REFRESHTOKEN",
    });

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      refreshToken,
    });

    await newUser.save();

    const responseData = await User.findOne({ email }).select(
      "-password -__v -refreshToken"
    );

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Đăng ký thành công",
      code: httpStatus.OK,
      data: {
        responseData,
      },
    });
  } catch (err) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Có lỗi xảy ra trong quá trình xử lý dữ liệu" + "/n" + err,
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};

module.exports = {
  login,
  register,
};
