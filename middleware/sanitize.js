import xss from "xss";

// Remove all HTML tags
function stripTags(str) {
  return str.replace(/<\/?[^>]+(>|$)/g, "");
}

function sanitizeText(str) {
  if (typeof str !== "string") return str;

  // 1. Remove all HTML tags completely
  const noTags = stripTags(str);

  // 2. Run XSS sanitizer as a second safety layer
  return xss(noTags, { whiteList: {} }); // empty whitelist = no tags allowed
}

const sanitizeInputs = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    // Sanitize all string fields dynamically
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeText(req.body[key]);
      }
    }
  }

  next();
};

export default sanitizeInputs;