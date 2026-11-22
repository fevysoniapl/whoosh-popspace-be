class Helper {
  today() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }

  getPagination(params) {
    const page = Math.max(1, parseInt(params.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(params.limit, 10) || 20));
    return { page, limit, offset: (page - 1) * limit };
  }

  getPaginationData(rows, count, page, limit) {
    return {
      items: rows,
      total: count,
      page,
      limit,
      total_pages: Math.ceil(count / limit),
    };
  }

  validate(data, schema) {
    const { error, value } = schema.validate(data ?? {}, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return {
        status: false,
        code: 400,
        message: 'Validasi gagal',
        details: error.details.map((detail) => detail.message),
      };
    }

    return { status: true, value };
  }

  sendResponse(res, result) {
    const code = result.code || (result.status ? 200 : 400);
    const body = { status: result.status };
    if (result.message) body.message = result.message;
    if (result.details) body.details = result.details;
    if (result.error) body.error = result.error;
    if (result.data !== undefined) body.data = result.data;
    return res.status(code).json(body);
  }
}

export default new Helper();