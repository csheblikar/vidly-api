const auth = require("../../../middleware/auth");
const User = require("../../../models/user");

describe("auth middleware", () => {
  let token;

  it("should populate req.user with payload", () => {
    const user = new User({ isAdmin: true });
    token = user.generateAuthToken();

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user).toMatchObject({
      sub: user._id.toHexString(),
      admin: true,
    });
  });
});
