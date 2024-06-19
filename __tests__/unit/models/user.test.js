const jwt = require("jsonwebtoken");
const User = require("../../../models/user");

describe("user.generateAuthToken", () => {
  it("should return a valid auth token", () => {
    const user = new User({ isAdmin: true });
    const token = user.generateAuthToken();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded).toMatchObject({ sub: user._id.toHexString(), admin: true });
  });
});
