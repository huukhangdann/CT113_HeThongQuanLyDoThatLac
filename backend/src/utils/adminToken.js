const crypto = require('crypto');

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;
const tokenSecret = process.env.ADMIN_TOKEN_SECRET || crypto.randomBytes(32).toString('hex');

const isAdmin = user => user && (
    user.VT_id === 'VT02'
    || user.ND_VaiTro === 'admin'
    || user.ND_Role === 'admin'
);

const sign = value => crypto
    .createHmac('sha256', tokenSecret)
    .update(value)
    .digest('base64url');

exports.createAdminToken = userId => {
    const payload = Buffer.from(JSON.stringify({
        sub: userId,
        role: 'admin',
        exp: Date.now() + TOKEN_TTL_MS
    })).toString('base64url');

    return `${payload}.${sign(payload)}`;
};

exports.requireAdmin = (req, res, next) => {
    const authorization = req.get('authorization') || '';
    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập bằng tài khoản quản trị.' });
    }

    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) {
        return res.status(401).json({ success: false, message: 'Phiên đăng nhập quản trị không hợp lệ.' });
    }

    const expected = sign(payload);
    const providedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (providedBuffer.length !== expectedBuffer.length
        || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
        return res.status(401).json({ success: false, message: 'Phiên đăng nhập quản trị không hợp lệ.' });
    }

    let tokenData;
    try {
        tokenData = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Phiên đăng nhập quản trị không hợp lệ.' });
    }

    const database = req.app.locals.database;
    const user = Object.values(database?.NguoiDung || {}).find(
        record => String(record.ND_id || '') === String(tokenData.sub || '')
    );
    if (tokenData.role !== 'admin' || !Number.isFinite(tokenData.exp) || tokenData.exp <= Date.now() || !isAdmin(user)) {
        return res.status(401).json({ success: false, message: 'Phiên quản trị đã hết hạn hoặc không còn quyền truy cập.' });
    }

    req.adminUser = user;
    next();
};

exports.isAdmin = isAdmin;
