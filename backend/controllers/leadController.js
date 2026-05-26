const Lead = require("../models/Lead");

exports.create = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);

    res.status(201).json({
      success: true,
      lead
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message
    });
  }
};

exports.list = async (_req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      leads
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found"
      });
    }

    res.json({
      success: true,
      lead
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      lead
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Lead deleted"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.stats = async (_req, res) => {
  try {
    const total = await Lead.countDocuments();

    res.json({
      success: true,
      total
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};
exports.list = async (_req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      leads
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found"
      });
    }

    res.json({
      success: true,
      lead
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      lead
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Lead deleted"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.stats = async (_req, res) => {
  try {
    const total = await Lead.countDocuments();

    res.json({
      success: true,
      total
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};