class ApiResponse {
  static ok(res, message = "OK", data = null) {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static created(res, message = "Created", data = null) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static oauthToken(res, payload) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");

    return res.status(200).json(payload);
  }

  static oauthError(res, statusCode, error, errorDescription) {
    const payload = { error };

    if (errorDescription) {
      payload.error_description = errorDescription;
    }

    return res.status(statusCode).json(payload);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

export default ApiResponse;
