// api/index.ts
import crypto from "crypto";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

// src/data/curriculumTypes.ts
function ch(id, chapterNumber, en, bn, hi, topics, textbookName, verificationStatus = "verified") {
  return {
    id,
    chapterNumber,
    title: { en, bn, hi },
    keyConcepts: topics,
    topics,
    textbookName,
    verificationStatus
  };
}

// src/data/curriculumMath.ts
var TB_MATH_5 = {
  en: "Amar Ganit (Class V \u2014 WBBPE)",
  bn: "\u0986\u09AE\u09BE\u09B0 \u0997\u09A3\u09BF\u09A4 (\u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBPE)",
  hi: "\u0906\u092E\u093E\u0930 \u0917\u0923\u093F\u0924 (\u0915\u0915\u094D\u0937\u093E 5 \u2014 WBBPE)"
};
var TB_MATH_6 = {
  en: "Ganit Prabha (Class VI \u2014 WBBSE)",
  bn: "\u0997\u09A3\u09BF\u09A4 \u09AA\u09CD\u09B0\u09AD\u09BE (\u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0917\u0923\u093F\u0924 \u092A\u094D\u0930\u092D\u093E (\u0915\u0915\u094D\u0937\u093E 6 \u2014 WBBSE)"
};
var TB_MATH_7 = {
  en: "Ganit Prabha (Class VII \u2014 WBBSE)",
  bn: "\u0997\u09A3\u09BF\u09A4 \u09AA\u09CD\u09B0\u09AD\u09BE (\u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0917\u0923\u093F\u0924 \u092A\u094D\u0930\u092D\u093E (\u0915\u0915\u094D\u0937\u093E 7 \u2014 WBBSE)"
};
var TB_MATH_8 = {
  en: "Ganit Prabha (Class VIII \u2014 WBBSE)",
  bn: "\u0997\u09A3\u09BF\u09A4 \u09AA\u09CD\u09B0\u09AD\u09BE (\u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0917\u0923\u093F\u0924 \u092A\u094D\u0930\u092D\u093E (\u0915\u0915\u094D\u0937\u093E 8 \u2014 WBBSE)"
};
var TB_MATH_9 = {
  en: "Ganit Prakash (Class IX \u2014 WBBSE)",
  bn: "\u0997\u09A3\u09BF\u09A4 \u09AA\u09CD\u09B0\u0995\u09BE\u09B6 (\u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0917\u0923\u093F\u0924 \u092A\u094D\u0930\u0915\u093E\u0936 (\u0915\u0915\u094D\u0937\u093E 9 \u2014 WBBSE)"
};
var TB_MATH_10 = {
  en: "Ganit Prakash (Class X \u2014 WBBSE Madhyamik)",
  bn: "\u0997\u09A3\u09BF\u09A4 \u09AA\u09CD\u09B0\u0995\u09BE\u09B6 (\u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995)",
  hi: "\u0917\u0923\u093F\u0924 \u092A\u094D\u0930\u0915\u093E\u0936 (\u0915\u0915\u094D\u0937\u093E 10 \u2014 WBBSE \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915)"
};
var MATHEMATICS_SUBJECT = {
  id: "mathematics",
  name: {
    en: "Mathematics",
    bn: "\u0997\u09A3\u09BF\u09A4 (Mathematics)",
    hi: "\u0917\u0923\u093F\u0924 (Mathematics)"
  },
  shortDesc: {
    en: "Arithmetic, algebra, geometry, mensuration, trigonometry, and statistics from official Amar Ganit, Ganit Prabha & Ganit Prakash textbooks.",
    bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AA\u09B0\u09CD\u09B7\u09A6\u09C7\u09B0 \u0986\u09AE\u09BE\u09B0 \u0997\u09A3\u09BF\u09A4, \u0997\u09A3\u09BF\u09A4 \u09AA\u09CD\u09B0\u09AD\u09BE \u0993 \u0997\u09A3\u09BF\u09A4 \u09AA\u09CD\u09B0\u0995\u09BE\u09B6 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u09AA\u09BE\u099F\u09BF\u0997\u09A3\u09BF\u09A4, \u09AC\u09C0\u099C\u0997\u09A3\u09BF\u09A4, \u099C\u09CD\u09AF\u09BE\u09AE\u09BF\u09A4\u09BF, \u09AA\u09B0\u09BF\u09AE\u09BF\u09A4\u09BF, \u09A4\u09CD\u09B0\u09BF\u0995\u09CB\u09A3\u09AE\u09BF\u09A4\u09BF \u0993 \u09B0\u09BE\u09B6\u09BF\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8\u0964",
    hi: "\u092A\u0936\u094D\u091A\u093F\u092E \u092C\u0902\u0917\u093E\u0932 \u092C\u094B\u0930\u094D\u0921 \u0915\u0940 \u0906\u092E\u093E\u0930 \u0917\u0923\u093F\u0924, \u0917\u0923\u093F\u0924 \u092A\u094D\u0930\u092D\u093E \u0914\u0930 \u0917\u0923\u093F\u0924 \u092A\u094D\u0930\u0915\u093E\u0936 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915\u094B\u0902 \u0938\u0947 \u0905\u0902\u0915\u0917\u0923\u093F\u0924, \u092C\u0940\u091C\u0917\u0923\u093F\u0924, \u091C\u094D\u092F\u093E\u092E\u093F\u0924\u093F, \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092E\u093F\u0924\u093F, \u0924\u094D\u0930\u093F\u0915\u094B\u0923\u092E\u093F\u0924\u093F \u0914\u0930 \u0938\u093E\u0902\u0916\u094D\u092F\u093F\u0915\u0940\u0964"
  },
  domainGuardKeywords: [
    "number",
    "fraction",
    "decimal",
    "ratio",
    "percentage",
    "algebra",
    "equation",
    "polynomial",
    "geometry",
    "triangle",
    "circle",
    "angle",
    "area",
    "perimeter",
    "volume",
    "trigonometry",
    "statistics"
  ],
  curriculumByClass: {
    5: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_MATH_5,
      syllabusVersion: "WBBPE Primary Curriculum (Current Edition)",
      officialSource: "West Bengal Board of Primary Education \u2014 Amar Ganit Class V",
      boardNote: {
        en: "Official WBBPE Class V Amar Ganit \u2014 All 20 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBPE) \u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0986\u09AE\u09BE\u09B0 \u0997\u09A3\u09BF\u09A4 \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E8\u09E6\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBPE \u0915\u0915\u094D\u0937\u093E 5 \u0906\u092E\u093E\u0930 \u0917\u0923\u093F\u0924 \u2014 \u0938\u092D\u0940 20 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("m5_c1", 1, "Ch 1: Revision of Previous Lessons & Four Operations", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AA\u09C2\u09B0\u09CD\u09AC\u09AA\u09BE\u09A0\u09C7\u09B0 \u09AA\u09C1\u09A8\u09B0\u09BE\u09B2\u09CB\u099A\u09A8\u09BE \u0993 \u099A\u09BE\u09B0 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092A\u0942\u0930\u094D\u0935 \u092A\u093E\u0920 \u0915\u0940 \u092A\u0941\u0928\u0930\u093E\u0935\u0943\u0924\u094D\u0924\u093F \u0914\u0930 \u091A\u093E\u0930 \u0938\u0902\u0915\u094D\u0930\u093F\u092F\u093E\u090F\u0901", ["4-digit numbers", "Addition and subtraction", "Place value with abacus balls"], TB_MATH_5),
        ch("m5_c2", 2, "Ch 2: Five-Digit Numbers & Local/Intrinsic Value", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09AA\u09BE\u0981\u099A \u0985\u0999\u09CD\u0995\u09C7\u09B0 \u09B8\u0982\u0996\u09CD\u09AF\u09BE \u0993 \u09B8\u09CD\u09A5\u09BE\u09A8\u09C0\u09AF\u09BC \u09AE\u09BE\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u092A\u093E\u0901\u091A \u0905\u0902\u0915\u094B\u0902 \u0915\u0940 \u0938\u0902\u0916\u094D\u092F\u093E\u090F\u0901 \u0914\u0930 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u092E\u093E\u0928", ["Numbers up to 99999", "Expanded form", "Comparison of 5-digit numbers"], TB_MATH_5),
        ch("m5_c3", 3, "Ch 3: Addition & Subtraction of Five-Digit Numbers", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AA\u09BE\u0981\u099A \u0985\u0999\u09CD\u0995\u09C7\u09B0 \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09B0 \u09AF\u09CB\u0997 \u0993 \u09AC\u09BF\u09AF\u09BC\u09CB\u0997", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u092A\u093E\u0901\u091A \u0905\u0902\u0915\u094B\u0902 \u0915\u0940 \u0938\u0902\u0916\u094D\u092F\u093E\u0913\u0902 \u0915\u093E \u091C\u094B\u0921\u093C \u0914\u0930 \u0918\u091F\u093E\u0935", ["Word problems on addition", "Word problems on subtraction", "Borrowing and carrying"], TB_MATH_5),
        ch("m5_c4", 4, "Ch 4: Multiplication & Division of Large Numbers", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u0997\u09C1\u09A3 \u0993 \u09AD\u09BE\u0997\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u0997", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u0917\u0941\u0923\u093E \u0914\u0930 \u092D\u093E\u0917 \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E \u090F\u0935\u0902 \u0905\u0928\u0941\u092A\u094D\u0930\u092F\u094B\u0917", ["3-digit by 2-digit multiplication", "Long division", "Dividend = Divisor \xD7 Quotient + Remainder"], TB_MATH_5),
        ch("m5_c5", 5, "Ch 5: Multiples & Factors (G.C.D. / H.C.F. and L.C.M.)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u0997\u09C1\u09A3\u09BF\u09A4\u0995 \u0993 \u0997\u09C1\u09A3\u09A8\u09C0\u09AF\u09BC\u0995 (\u0997.\u09B8\u09BE.\u0997\u09C1. \u0993 \u09B2.\u09B8\u09BE.\u0997\u09C1.)", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u0917\u0941\u0923\u091C \u0914\u0930 \u0917\u0941\u0923\u0928\u0916\u0902\u0921 (\u092E.\u0938.\u092A. \u0914\u0930 \u0932.\u0938.\u092A.)", ["Prime and composite numbers", "Prime factorization", "HCF and LCM word problems"], TB_MATH_5),
        ch("m5_c6", 6, "Ch 6: Vulgar Fractions \u2014 Proper, Improper & Mixed Fractions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09B8\u09BE\u09AE\u09BE\u09A8\u09CD\u09AF \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6 \u2014 \u09AA\u09CD\u09B0\u0995\u09C3\u09A4, \u0985\u09AA\u09CD\u09B0\u0995\u09C3\u09A4 \u0993 \u09AE\u09BF\u09B6\u09CD\u09B0 \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u0938\u093E\u0927\u093E\u0930\u0923 \u092D\u093F\u0928\u094D\u0928 \u2014 \u0909\u091A\u093F\u0924, \u0905\u0928\u0941\u091A\u093F\u0924 \u0914\u0930 \u092E\u093F\u0936\u094D\u0930\u093F\u0924 \u092D\u093F\u0928\u094D\u0928", ["Equivalent fractions", "Lowest form of fractions", "Comparison of fractions"], TB_MATH_5),
        ch("m5_c7", 7, "Ch 7: Addition & Subtraction of Vulgar Fractions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6\u09C7\u09B0 \u09AF\u09CB\u0997 \u0993 \u09AC\u09BF\u09AF\u09BC\u09CB\u0997", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u092D\u093F\u0928\u094D\u0928\u094B\u0902 \u0915\u093E \u091C\u094B\u0921\u093C \u0914\u0930 \u0918\u091F\u093E\u0935", ["Like and unlike fraction addition", "Fraction subtraction", "Fractional parts of a whole"], TB_MATH_5),
        ch("m5_c8", 8, "Ch 8: Decimal Fractions \u2014 Tenths, Hundredths & Thousandths", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09A6\u09B6\u09AE\u09BF\u0995 \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6 \u2014 \u09A6\u09B6\u09BE\u0982\u09B6, \u09B6\u09A4\u09BE\u0982\u09B6 \u0993 \u09B8\u09B9\u09B8\u09CD\u09B0\u09BE\u0982\u09B6", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u0926\u0936\u092E\u0932\u0935 \u092D\u093F\u0928\u094D\u0928 \u2014 \u0926\u0936\u093E\u0902\u0936, \u0936\u0924\u093E\u0902\u0936 \u0914\u0930 \u0938\u0939\u0938\u094D\u0930\u093E\u0902\u0936", ["Place value in decimals", "Conversion between fractions and decimals", "Ordering decimals"], TB_MATH_5),
        ch("m5_c9", 9, "Ch 9: Addition & Subtraction of Decimal Fractions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u09A6\u09B6\u09AE\u09BF\u0995 \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6\u09C7\u09B0 \u09AF\u09CB\u0997 \u0993 \u09AC\u09BF\u09AF\u09BC\u09CB\u0997 (\u099F\u09BE\u0995\u09BE-\u09AA\u09AF\u09BC\u09B8\u09BE \u0993 \u09AA\u09B0\u09BF\u09AE\u09BE\u09AA)", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u0926\u0936\u092E\u0932\u0935 \u092D\u093F\u0928\u094D\u0928\u094B\u0902 \u0915\u093E \u091C\u094B\u0921\u093C \u0914\u0930 \u0918\u091F\u093E\u0935 (\u092E\u0941\u0926\u094D\u0930\u093E \u0914\u0930 \u092E\u093E\u092A\u0928)", ["Rupees and Paise calculations", "Metre and centimetre decimals", "Word problems on decimals"], TB_MATH_5),
        ch("m5_c10", 10, "Ch 10: Metric System \u2014 Length, Mass & Capacity", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E6: \u09AE\u09C7\u099F\u09CD\u09B0\u09BF\u0995 \u09AA\u09A6\u09CD\u09A7\u09A4\u09BF \u2014 \u09A6\u09C8\u09B0\u09CD\u0998\u09CD\u09AF, \u0993\u099C\u09A8 \u0993 \u09A4\u09B0\u09B2\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AE\u09BE\u09AA", "\u0905\u0927\u094D\u092F\u093E\u092F 10: \u092E\u0940\u091F\u094D\u0930\u093F\u0915 \u092A\u094D\u0930\u0923\u093E\u0932\u0940 \u2014 \u0932\u0902\u092C\u093E\u0908, \u0926\u094D\u0930\u0935\u094D\u092F\u092E\u093E\u0928 \u0914\u0930 \u0927\u093E\u0930\u093F\u0924\u093E", ["km, m, cm, mm conversions", "kg and gram conversions", "litre and millilitre problems"], TB_MATH_5),
        ch("m5_c11", 11, "Ch 11: Perimeter & Area of Squares and Rectangles", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E7: \u0986\u09AF\u09BC\u09A4\u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0 \u0993 \u09AC\u09B0\u09CD\u0997\u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09C7\u09B0 \u09AA\u09B0\u09BF\u09B8\u09C0\u09AE\u09BE \u098F\u09AC\u0982 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09AB\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 11: \u0906\u092F\u0924 \u0914\u0930 \u0935\u0930\u094D\u0917 \u0915\u093E \u092A\u0930\u093F\u092E\u093E\u092A \u090F\u0935\u0902 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092B\u0932", ["Perimeter of rectangle = 2(l+b)", "Perimeter of square = 4\xD7side", "Unit squares and area"], TB_MATH_5),
        ch("m5_c12", 12, "Ch 12: Square Numbers & Square Roots by Factorization", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E8: \u09AC\u09B0\u09CD\u0997\u09B8\u0982\u0996\u09CD\u09AF\u09BE \u0993 \u0989\u09CE\u09AA\u09BE\u09A6\u0995\u09C7\u09B0 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF\u09C7 \u09AC\u09B0\u09CD\u0997\u09AE\u09C2\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 12: \u0935\u0930\u094D\u0917 \u0938\u0902\u0916\u094D\u092F\u093E\u090F\u0901 \u0914\u0930 \u0917\u0941\u0923\u0928\u0916\u0902\u0921 \u0926\u094D\u0935\u093E\u0930\u093E \u0935\u0930\u094D\u0917\u092E\u0942\u0932", ["Perfect squares", "Finding square root using prime factors"], TB_MATH_5),
        ch("m5_c13", 13, "Ch 13: Time, Calendar & 24-Hour Clock", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E9: \u09B8\u09AE\u09AF\u09BC\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AE\u09BE\u09AA \u0993 \u0995\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09A1\u09BE\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 13: \u0938\u092E\u092F \u0915\u093E \u092E\u093E\u092A\u0928 \u0914\u0930 \u0915\u0948\u0932\u0947\u0902\u0921\u0930", ["Hours, minutes, seconds", "Leap year calculation", "Addition and subtraction of time"], TB_MATH_5),
        ch("m5_c14", 14, "Ch 14: Unitary Method (Direct Variation Problems)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EA: \u0990\u0995\u09BF\u0995 \u09A8\u09BF\u09AF\u09BC\u09AE", "\u0905\u0927\u094D\u092F\u093E\u092F 14: \u0910\u0915\u093F\u0915 \u0928\u093F\u092F\u092E", ["Finding value of 1 unit", "Finding value of multiple units", "Cost and quantity problems"], TB_MATH_5),
        ch("m5_c15", 15, "Ch 15: Simplification with Brackets (BODMAS)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EB: \u09B8\u09B0\u09B2\u09C0\u0995\u09B0\u09A3 (\u09AC\u09A8\u09CD\u09A7\u09A8\u09C0\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0993 BODMAS)", "\u0905\u0927\u094D\u092F\u093E\u092F 15: \u0938\u0930\u0932\u0940\u0915\u0930\u0923 (\u0915\u094B\u0937\u094D\u0920\u0915\u094B\u0902 \u0915\u093E \u092A\u094D\u0930\u092F\u094B\u0917 \u0914\u0930 BODMAS)", ["Vinculum, first, second, third brackets", "Order of operations"], TB_MATH_5),
        ch("m5_c16", 16, "Ch 16: Lines, Line Segments, Rays & Angles", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EC: \u09B8\u09B0\u09B2\u09B0\u09C7\u0996\u09BE, \u09B0\u09C7\u0996\u09BE\u0982\u09B6, \u09B0\u09B6\u09CD\u09AE\u09BF \u0993 \u0995\u09CB\u09A3\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 16: \u0930\u0947\u0916\u093E, \u0930\u0947\u0916\u093E\u0916\u0902\u0921, \u0915\u093F\u0930\u0923 \u0914\u0930 \u0915\u094B\u0923 \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Acute, obtuse, right, straight, reflex angles", "Protractor measurement"], TB_MATH_5),
        ch("m5_c17", 17, "Ch 17: Triangles \u2014 Classification by Sides and Angles", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09ED: \u09A4\u09CD\u09B0\u09BF\u09AD\u09C1\u099C\u09C7\u09B0 \u09AA\u09CD\u09B0\u0995\u09BE\u09B0\u09AD\u09C7\u09A6 (\u09AC\u09BE\u09B9\u09C1 \u0993 \u0995\u09CB\u09A3 \u0985\u09A8\u09C1\u09B8\u09BE\u09B0\u09C7)", "\u0905\u0927\u094D\u092F\u093E\u092F 17: \u0924\u094D\u0930\u093F\u092D\u0941\u091C\u094B\u0902 \u0915\u093E \u0935\u0930\u094D\u0917\u0940\u0915\u0930\u0923 (\u092D\u0941\u091C\u093E\u0913\u0902 \u0914\u0930 \u0915\u094B\u0923\u094B\u0902 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930)", ["Equilateral, isosceles, scalene triangles", "Acute, right, obtuse-angled triangles"], TB_MATH_5),
        ch("m5_c18", 18, "Ch 18: Circles \u2014 Centre, Radius, Diameter & Chord", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EE: \u09AC\u09C3\u09A4\u09CD\u09A4\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE \u2014 \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0, \u09AC\u09CD\u09AF\u09BE\u09B8\u09BE\u09B0\u09CD\u09A7, \u09AC\u09CD\u09AF\u09BE\u09B8 \u0993 \u099C\u09CD\u09AF\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 18: \u0935\u0943\u0924\u094D\u0924 \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E \u2014 \u0915\u0947\u0902\u0926\u094D\u0930, \u0924\u094D\u0930\u093F\u091C\u094D\u092F\u093E, \u0935\u094D\u092F\u093E\u0938 \u0914\u0930 \u091C\u0940\u0935\u093E", ["Parts of a circle", "Diameter = 2 \xD7 Radius", "Drawing circles with compass"], TB_MATH_5),
        ch("m5_c19", 19, "Ch 19: 3D Solids \u2014 Cuboid, Cube, Cylinder, Cone & Sphere", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EF: \u0998\u09A8\u09AC\u09B8\u09CD\u09A4\u09C1\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE \u2014 \u0986\u09AF\u09BC\u09A4\u0998\u09A8, \u0998\u09A8\u0995, \u099A\u09CB\u0999, \u09B6\u0999\u09CD\u0995\u09C1 \u0993 \u0997\u09CB\u09B2\u0995", "\u0905\u0927\u094D\u092F\u093E\u092F 19: \u0920\u094B\u0938 \u0906\u0915\u0943\u0924\u093F\u092F\u093E\u0901 \u2014 \u0918\u0928\u093E\u092D, \u0918\u0928, \u092C\u0947\u0932\u0928, \u0936\u0902\u0915\u0941 \u0914\u0930 \u0917\u094B\u0932\u093E", ["Faces, edges, and vertices of solids", "Curved and plane surfaces"], TB_MATH_5),
        ch("m5_c20", 20, "Ch 20: Number & Geometric Patterns and Pictographs", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E6: \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09B0 \u0993 \u099C\u09CD\u09AF\u09BE\u09AE\u09BF\u09A4\u09BF\u0995 \u09AA\u09CD\u09AF\u09BE\u099F\u09BE\u09B0\u09CD\u09A8 \u098F\u09AC\u0982 \u099A\u09BF\u09A4\u09CD\u09B0\u09B2\u09C7\u0996", "\u0905\u0927\u094D\u092F\u093E\u092F 20: \u0938\u0902\u0916\u094D\u092F\u093E \u090F\u0935\u0902 \u091C\u094D\u092F\u093E\u092E\u093F\u0924\u0940\u092F \u092A\u0948\u091F\u0930\u094D\u0928 \u0914\u0930 \u091A\u093F\u0924\u094D\u0930\u093E\u0932\u0947\u0916", ["Number sequences", "Symmetry and tiling patterns", "Reading tally marks and pictographs"], TB_MATH_5)
      ]
    },
    6: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_MATH_6,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Ganit Prabha Class VI (Chapters 1\u201328)",
      boardNote: {
        en: "Official WBBSE Class VI Ganit Prabha \u2014 All 28 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0997\u09A3\u09BF\u09A4 \u09AA\u09CD\u09B0\u09AD\u09BE \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E8\u09EE\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 6 \u0917\u0923\u093F\u0924 \u092A\u094D\u0930\u092D\u093E \u2014 \u0938\u092D\u0940 28 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("m6_c1", 1, "Ch 1: Revision of Previous Lessons (Simplification, Fractions, HCF & LCM)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AA\u09C2\u09B0\u09CD\u09AC\u09AA\u09BE\u09A0\u09C7\u09B0 \u09AA\u09C1\u09A8\u09B0\u09BE\u09B2\u09CB\u099A\u09A8\u09BE (\u09B8\u09B0\u09B2\u09C0\u0995\u09B0\u09A3, \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6, \u0997.\u09B8\u09BE.\u0997\u09C1. \u0993 \u09B2.\u09B8\u09BE.\u0997\u09C1.)", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092A\u0942\u0930\u094D\u0935 \u092A\u093E\u0920 \u0915\u0940 \u092A\u0941\u0928\u0930\u093E\u0935\u0943\u0924\u094D\u0924\u093F (\u0938\u0930\u0932\u0940\u0915\u0930\u0923, \u092D\u093F\u0928\u094D\u0928, \u092E.\u0938.\u092A. \u0914\u0930 \u0932.\u0938.\u092A.)", ["BODMAS rules", "HCF and LCM applications", "Operations on fractions and decimals"], TB_MATH_6),
        ch("m6_c2", 2, "Ch 2: Concept of Seven & Eight Digit Numbers", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09B8\u09BE\u09A4 \u0993 \u0986\u099F \u0985\u0999\u09CD\u0995\u09C7\u09B0 \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u0938\u093E\u0924 \u0914\u0930 \u0906\u0920 \u0905\u0902\u0915\u094B\u0902 \u0915\u0940 \u0938\u0902\u0916\u094D\u092F\u093E\u0913\u0902 \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Indian and International place value systems", "Crore and Million", "Estimation and rounding off"], TB_MATH_6),
        ch("m6_c3", 3, "Ch 3: Logical Approximation of Numbers", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09B8\u0982\u0996\u09CD\u09AF\u09BE \u09AC\u09BF\u09B7\u09AF\u09BC\u09C7 \u09AF\u09C1\u0995\u09CD\u09A4\u09BF\u09B8\u09AE\u09CD\u09AE\u09A4 \u0985\u09A8\u09C1\u09AE\u09BE\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u0938\u0902\u0916\u094D\u092F\u093E\u0913\u0902 \u0915\u093E \u0924\u093E\u0930\u094D\u0915\u093F\u0915 \u0938\u0928\u094D\u0928\u093F\u0915\u091F\u0928", ["Rounding to nearest 10, 100, 1000", "Estimating sums, differences, products"], TB_MATH_6),
        ch("m6_c4", 4, "Ch 4: Roman Numerals up to 100", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u098F\u0995\u09B6\u09A4 \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u09B0\u09CB\u09AE\u09BE\u09A8 \u09B8\u0982\u0996\u09CD\u09AF\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 4: 100 \u0924\u0915 \u0930\u094B\u092E\u0928 \u0938\u0902\u0916\u094D\u092F\u093E\u090F\u0901", ["Symbols I, V, X, L, C", "Rules for writing Roman numerals up to 100"], TB_MATH_6),
        ch("m6_c5", 5, "Ch 5: Concept of Algebraic Variables & Expressions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AC\u09C0\u099C\u0997\u09BE\u09A3\u09BF\u09A4\u09BF\u0995 \u099A\u09B2\u09B0\u09BE\u09B6\u09BF\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u092C\u0940\u091C\u0940\u092F \u091A\u0930\u094B\u0902 \u0914\u0930 \u0935\u094D\u092F\u0902\u091C\u0915\u094B\u0902 \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Variables and constants", "Forming algebraic expressions", "Patterns with matchsticks"], TB_MATH_6),
        ch("m6_c6", 6, "Ch 6: Multiplication & Division of Fractions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6\u0995\u09C7 \u09AA\u09C2\u09B0\u09CD\u09A3\u09B8\u0982\u0996\u09CD\u09AF\u09BE \u0993 \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6 \u09A6\u09BF\u09AF\u09BC\u09C7 \u0997\u09C1\u09A3 \u0993 \u09AD\u09BE\u0997", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u092D\u093F\u0928\u094D\u0928\u094B\u0902 \u0915\u093E \u092A\u0942\u0930\u094D\u0923 \u0938\u0902\u0916\u094D\u092F\u093E \u0914\u0930 \u092D\u093F\u0928\u094D\u0928 \u0938\u0947 \u0917\u0941\u0923\u093E \u090F\u0935\u0902 \u092D\u093E\u0917", ["Reciprocal of a fraction", "Fraction multiplication and division", "'Of' operation"], TB_MATH_6),
        ch("m6_c7", 7, "Ch 7: Multiplication & Division of Decimal Fractions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09A6\u09B6\u09AE\u09BF\u0995 \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6\u0995\u09C7 \u09AA\u09C2\u09B0\u09CD\u09A3\u09B8\u0982\u0996\u09CD\u09AF\u09BE \u0993 \u09A6\u09B6\u09AE\u09BF\u0995 \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6 \u09A6\u09BF\u09AF\u09BC\u09C7 \u0997\u09C1\u09A3 \u0993 \u09AD\u09BE\u0997", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u0926\u0936\u092E\u0932\u0935 \u092D\u093F\u0928\u094D\u0928\u094B\u0902 \u0915\u093E \u0917\u0941\u0923\u093E \u0914\u0930 \u092D\u093E\u0917", ["Shifting decimal point", "Division of decimals by 10, 100, 1000 and decimals"], TB_MATH_6),
        ch("m6_c8", 8, "Ch 8: Metric System", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09AE\u09C7\u099F\u09CD\u09B0\u09BF\u0995 \u09AA\u09A6\u09CD\u09A7\u09A4\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u092E\u0940\u091F\u094D\u0930\u093F\u0915 \u092A\u094D\u0930\u0923\u093E\u0932\u0940", ["Conversion across kilo, hecto, deca, unit, deci, centi, milli", "Word problems on metric units"], TB_MATH_6),
        ch("m6_c9", 9, "Ch 9: Percentage", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u09B6\u09A4\u0995\u09B0\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u092A\u094D\u0930\u0924\u093F\u0936\u0924", ["Converting fractions and decimals to percentage", "Finding percentage of a quantity", "Word problems"], TB_MATH_6),
        ch("m6_c10", 10, "Ch 10: Recurring Decimal Numbers", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E6: \u0986\u09AC\u09C3\u09A4\u09CD\u09A4 \u09A6\u09B6\u09AE\u09BF\u0995 \u09B8\u0982\u0996\u09CD\u09AF\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 10: \u0906\u0935\u0930\u094D\u0924 \u0926\u0936\u092E\u0932\u0935 \u0938\u0902\u0916\u094D\u092F\u093E\u090F\u0901", ["Terminating and non-terminating recurring decimals", "Pure and mixed recurring decimals", "Conversion to vulgar fractions"], TB_MATH_6),
        ch("m6_c11", 11, "Ch 11: Regular Solids and Nets", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E7: \u09B8\u09C1\u09B7\u09AE \u0998\u09A8\u09AC\u09B8\u09CD\u09A4\u09C1 \u0997\u09A0\u09A8 \u09AC\u09BF\u09B7\u09AF\u09BC\u0995 \u099C\u09CD\u09AF\u09BE\u09AE\u09BF\u09A4\u09BF\u0995 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 11: \u0938\u092E \u0920\u094B\u0938 \u0906\u0915\u0943\u0924\u093F\u092F\u094B\u0902 \u0915\u0940 \u091C\u094D\u092F\u093E\u092E\u093F\u0924\u0940\u092F \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Faces, edges, vertices", "Euler's formula F + V - E = 2", "Prisms and pyramids"], TB_MATH_6),
        ch("m6_c12", 12, "Ch 12:HCF and LCM of Three Numbers", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E8: \u09A4\u09BF\u09A8\u099F\u09BF \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09B0 \u0997.\u09B8\u09BE.\u0997\u09C1. \u0993 \u09B2.\u09B8\u09BE.\u0997\u09C1.", "\u0905\u0927\u094D\u092F\u093E\u092F 12: \u0924\u0940\u0928 \u0938\u0902\u0916\u094D\u092F\u093E\u0913\u0902 \u0915\u093E \u092E.\u0938.\u092A. \u0914\u0930 \u0932.\u0938.\u092A.", ["Relation between HCF and LCM", "Division method for HCF", "Word problems"], TB_MATH_6),
        ch("m6_c13", 13, "Ch 13: Data Handling & Bar Graphs", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E9: \u09A4\u09A5\u09CD\u09AF \u09B8\u09BE\u099C\u09BE\u09A8\u09CB \u0993 \u09AC\u09BF\u099A\u09BE\u09B0 \u098F\u09AC\u0982 \u09B8\u09CD\u09A4\u09AE\u09CD\u09AD\u099A\u09BF\u09A4\u09CD\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 13: \u0906\u0901\u0915\u0921\u093C\u094B\u0902 \u0915\u093E \u092A\u094D\u0930\u092C\u0902\u0927\u0928 \u0914\u0930 \u0926\u0902\u0921 \u0906\u0932\u0947\u0916", ["Tally marks", "Frequency distribution table", "Drawing and interpreting bar graphs"], TB_MATH_6),
        ch("m6_c14", 14, "Ch 14: Line, Line Segment, Ray & Point", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EA: \u09B0\u09C7\u0996\u09BE, \u09B0\u09C7\u0996\u09BE\u0982\u09B6, \u09B0\u09B6\u09CD\u09AE\u09BF \u0993 \u09AC\u09BF\u09A8\u09CD\u09A6\u09C1 \u09AC\u09BF\u09B7\u09AF\u09BC\u0995 \u09AC\u09BF\u09B8\u09CD\u09A4\u09C3\u09A4 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 14: \u0930\u0947\u0916\u093E, \u0930\u0947\u0916\u093E\u0916\u0902\u0921, \u0915\u093F\u0930\u0923 \u0914\u0930 \u092C\u093F\u0902\u0926\u0941 \u0915\u0940 \u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Collinear and non-collinear points", "Intersecting and parallel lines", "Concurrent lines"], TB_MATH_6),
        ch("m6_c15", 15, "Ch 15: Area & Perimeter of Plane Figures", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EB: \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09AB\u09B2 \u0993 \u09AA\u09B0\u09BF\u09B8\u09C0\u09AE\u09BE \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC", "\u0905\u0927\u094D\u092F\u093E\u092F 15: \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092B\u0932 \u0914\u0930 \u092A\u0930\u093F\u092E\u093E\u092A \u0928\u093F\u0930\u094D\u0927\u093E\u0930\u0923", ["Area and perimeter of rectangles and squares", "Pathway area problems"], TB_MATH_6),
        ch("m6_c16", 16, "Ch 16: Directed Numbers (Integers) & Number Line", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EC: \u09A8\u09BF\u09AF\u09BC\u09A8\u09CD\u09A4\u09CD\u09B0\u09BF\u09A4 \u09B8\u0982\u0996\u09CD\u09AF\u09BE \u0993 \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09B0\u09C7\u0996\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 16: \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0924 \u0938\u0902\u0916\u094D\u092F\u093E\u090F\u0901 (\u092A\u0942\u0930\u094D\u0923\u093E\u0902\u0915) \u0914\u0930 \u0938\u0902\u0916\u094D\u092F\u093E \u0930\u0947\u0916\u093E", ["Positive and negative integers", "Absolute value", "Addition and subtraction of integers on number line"], TB_MATH_6),
        ch("m6_c17", 17, "Ch 17: Basic Geometric Instruments & Constructions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09ED: \u099C\u09CD\u09AF\u09BE\u09AE\u09BF\u09A4\u09BF\u09AC\u0995\u09CD\u09B8\u09C7\u09B0 \u09A8\u09BE\u09A8\u09BE \u0989\u09AA\u0995\u09B0\u09A3 \u09B8\u09B9\u09AF\u09CB\u0997\u09C7 \u09AC\u09BF\u09AD\u09BF\u09A8\u09CD\u09A8 \u099C\u09CD\u09AF\u09BE\u09AE\u09BF\u09A4\u09BF\u0995 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 17: \u091C\u094D\u092F\u093E\u092E\u093F\u0924\u093F \u092C\u0949\u0915\u094D\u0938 \u0915\u0947 \u0909\u092A\u0915\u0930\u0923\u094B\u0902 \u0938\u0947 \u0935\u093F\u092D\u093F\u0928\u094D\u0928 \u091C\u094D\u092F\u093E\u092E\u093F\u0924\u0940\u092F \u0905\u0935\u0927\u093E\u0930\u0923\u093E\u090F\u0901", ["Using ruler, compass, protractor, set-squares", "Constructing line segments and perpendiculars"], TB_MATH_6),
        ch("m6_c18", 18, "Ch 18: Square Root (Factorization & Division Method)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EE: \u09AC\u09B0\u09CD\u0997\u09AE\u09C2\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 18: \u0935\u0930\u094D\u0917\u092E\u0942\u0932", ["Square root of integers and fractions", "Long division method for square roots"], TB_MATH_6),
        ch("m6_c19", 19, "Ch 19: Measurement of Time", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EF: \u09B8\u09AE\u09AF\u09BC\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AE\u09BE\u09AA", "\u0905\u0927\u094D\u092F\u093E\u092F 19: \u0938\u092E\u092F \u0915\u093E \u092E\u093E\u092A\u0928", ["Calculations with years, months, days, hours, minutes, seconds"], TB_MATH_6),
        ch("m6_c20", 20, "Ch 20:Detailed Concept of Circle", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E6: \u09AC\u09C3\u09A4\u09CD\u09A4 \u09AC\u09BF\u09B7\u09AF\u09BC\u0995 \u099C\u09CD\u09AF\u09BE\u09AE\u09BF\u09A4\u09BF\u0995 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 20: \u0935\u0943\u0924\u094D\u0924 \u0915\u0940 \u091C\u094D\u092F\u093E\u092E\u093F\u0924\u0940\u092F \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Centre, radius, diameter, chord, arc, sector, segment, concentric circles"], TB_MATH_6),
        ch("m6_c21", 21, "Ch 21: Concept of Ratio and Proportion", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E7: \u0985\u09A8\u09C1\u09AA\u09BE\u09A4 \u0993 \u09B8\u09AE\u09BE\u09A8\u09C1\u09AA\u09BE\u09A4\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 21: \u0905\u0928\u0941\u092A\u093E\u0924 \u0914\u0930 \u0938\u092E\u093E\u0928\u0941\u092A\u093E\u0924 \u0915\u0940 \u092A\u094D\u0930\u093E\u0930\u0902\u092D\u093F\u0915 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Ratio in simplest form", "Equivalent ratios", "Extremes and means in proportion"], TB_MATH_6),
        ch("m6_c22", 22, "Ch 22: Drawing Various Geometric Shapes (Angles & Bisectors)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E8: \u09AC\u09BF\u09AD\u09BF\u09A8\u09CD\u09A8 \u099C\u09CD\u09AF\u09BE\u09AE\u09BF\u09A4\u09BF\u0995 \u099A\u09BF\u09A4\u09CD\u09B0 \u0985\u0999\u09CD\u0995\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 22: \u0935\u093F\u092D\u093F\u0928\u094D\u0928 \u091C\u094D\u092F\u093E\u092E\u093F\u0924\u0940\u092F \u0906\u0915\u0943\u0924\u093F\u092F\u094B\u0902 \u0915\u0940 \u0930\u091A\u0928\u093E", ["Constructing 60\xB0, 120\xB0, 90\xB0, 45\xB0 with compass", "Perpendicular bisector and angle bisector"], TB_MATH_6),
        ch("m6_c23", 23, "Ch 23: Symmetry", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E9: \u09AA\u09CD\u09B0\u09A4\u09BF\u09B8\u09BE\u09AE\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 23: \u0938\u092E\u092E\u093F\u0924\u093F", ["Line of symmetry", "Horizontal, vertical, and multiple lines of symmetry", "Mirror reflection"], TB_MATH_6),
        ch("m6_c24", 24, "Ch 24: Viewing Solids from Different Perspectives", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09EA: \u09A8\u09BE\u09A8\u09BE \u09A6\u09BF\u0995 \u09A5\u09C7\u0995\u09C7 \u0998\u09A8\u09AC\u09B8\u09CD\u09A4\u09C1 (\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u0995\u09CD\u09B7 \u0993 \u09AA\u09B0\u09CB\u0995\u09CD\u09B7 \u099A\u09BF\u09A4\u09CD\u09B0)", "\u0905\u0927\u094D\u092F\u093E\u092F 24: \u0935\u093F\u092D\u093F\u0928\u094D\u0928 \u0926\u093F\u0936\u093E\u0913\u0902 \u0938\u0947 \u0920\u094B\u0938 \u0906\u0915\u0943\u0924\u093F\u092F\u094B\u0902 \u0915\u093E \u0905\u0935\u0932\u094B\u0915\u0928", ["Top view, front view, side view of 3D objects"], TB_MATH_6),
        ch("m6_c25", 25, "Ch 25: Fun with Numbers & Divisibility Rules", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09EB: \u09AE\u099C\u09BE\u09B0 \u0985\u0999\u09CD\u0995 \u0993 \u09AC\u09BF\u09AD\u09BE\u099C\u09CD\u09AF\u09A4\u09BE\u09B0 \u09A8\u09BF\u09AF\u09BC\u09AE", "\u0905\u0927\u094D\u092F\u093E\u092F 25: \u092E\u091C\u0947\u0926\u093E\u0930 \u0917\u0923\u093F\u0924 \u0914\u0930 \u0935\u093F\u092D\u093E\u091C\u094D\u092F\u0924\u093E \u0915\u0947 \u0928\u093F\u092F\u092E", ["Divisibility by 2, 3, 4, 5, 6, 8, 9, 10, 11", "Number puzzles"], TB_MATH_6),
        ch("m6_c26", 26, "Ch 26: Concept of Equivalence of Fractions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09EC: \u09B8\u09AE\u09A4\u09C1\u09B2\u09CD\u09AF \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 26: \u0938\u092E\u0924\u0941\u0932\u094D\u092F \u092D\u093F\u0928\u094D\u0928\u094B\u0902 \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Visual and numerical verification of equivalent fractions"], TB_MATH_6),
        ch("m6_c27", 27, "Ch 27: Equivalence of Fractions, Decimals & Percentages", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09ED: \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6, \u09A6\u09B6\u09AE\u09BF\u0995 \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6 \u0993 \u09B6\u09A4\u0995\u09B0\u09BE\u09B0 \u09B8\u09AE\u09A4\u09C1\u09B2\u09CD\u09AF\u09A4\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 27: \u092D\u093F\u0928\u094D\u0928, \u0926\u0936\u092E\u0932\u0935 \u092D\u093F\u0928\u094D\u0928 \u0914\u0930 \u092A\u094D\u0930\u0924\u093F\u0936\u0924 \u0915\u0940 \u0938\u092E\u0924\u0941\u0932\u094D\u092F\u0924\u093E", ["Interconversion between fraction, decimal, and percentage forms"], TB_MATH_6),
        ch("m6_c28", 28, "Ch 28: Concept of Sets & Simple Linear Equations", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09EE: \u09B8\u09AE\u09C0\u0995\u09B0\u09A3 \u0997\u09A0\u09A8 \u0993 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 28: \u0938\u092E\u0940\u0915\u0930\u0923 \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0914\u0930 \u0939\u0932", ["Trial and error method", "Balancing an equation", "Solving 1-variable linear equations"], TB_MATH_6)
      ]
    },
    7: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_MATH_7,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Ganit Prabha Class VII (Chapters 1\u201323)",
      boardNote: {
        en: "Official WBBSE Class VII Ganit Prabha \u2014 All 23 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0997\u09A3\u09BF\u09A4 \u09AA\u09CD\u09B0\u09AD\u09BE \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E8\u09E9\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 7 \u0917\u0923\u093F\u0924 \u092A\u094D\u0930\u092D\u093E \u2014 \u0938\u092D\u0940 23 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("m7_c1", 1, "Ch 1: Revision of Previous Lessons", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AA\u09C2\u09B0\u09CD\u09AC\u09AA\u09BE\u09A0\u09C7\u09B0 \u09AA\u09C1\u09A8\u09B0\u09BE\u09B2\u09CB\u099A\u09A8\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092A\u0942\u0930\u094D\u0935 \u092A\u093E\u0920 \u0915\u0940 \u092A\u0941\u0928\u0930\u093E\u0935\u0943\u0924\u094D\u0924\u093F", ["Fractions, decimals, unitary method, percentage, geometry review"], TB_MATH_7),
        ch("m7_c2", 2, "Ch 2: Ratio", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u0985\u09A8\u09C1\u09AA\u09BE\u09A4", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u0905\u0928\u0941\u092A\u093E\u0924", ["Ratio of like quantities", "Compound ratio", "Dividing a quantity in a given ratio"], TB_MATH_7),
        ch("m7_c3", 3, "Ch 3: Proportion", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09B8\u09AE\u09BE\u09A8\u09C1\u09AA\u09BE\u09A4", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u0938\u092E\u093E\u0928\u0941\u092A\u093E\u0924", ["Continued proportion", "Direct and inverse proportion", "Unitary vs proportion method"], TB_MATH_7),
        ch("m7_c4", 4, "Ch 4: Multiplication & Division of Integers", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09AA\u09C2\u09B0\u09CD\u09A3\u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09B0 \u09AF\u09CB\u0997, \u09AC\u09BF\u09AF\u09BC\u09CB\u0997, \u0997\u09C1\u09A3 \u0993 \u09AD\u09BE\u0997", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u092A\u0942\u0930\u094D\u0923\u093E\u0902\u0915\u094B\u0902 \u0915\u093E \u091C\u094B\u0921\u093C, \u0918\u091F\u093E\u0935, \u0917\u0941\u0923\u093E \u0914\u0930 \u092D\u093E\u0917", ["Properties of integer operations", "Commutative, associative, distributive laws"], TB_MATH_7),
        ch("m7_c5", 5, "Ch 5: Concept of Index (Exponents & Powers)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09B8\u09C2\u099A\u0995\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u0918\u093E\u0924\u093E\u0902\u0915 \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Laws of indices: a^m \xD7 a^n = a^(m+n), a^m / a^n = a^(m-n), (a^m)^n = a^(mn)", "Scientific notation"], TB_MATH_7),
        ch("m7_c6", 6, "Ch 6: Algebraic Operations (Addition, Subtraction, Multiplication, Division)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09AC\u09C0\u099C\u0997\u09BE\u09A3\u09BF\u09A4\u09BF\u0995 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u092C\u0940\u091C\u0940\u092F \u0938\u0902\u0915\u094D\u0930\u093F\u092F\u093E\u090F\u0901", ["Like and unlike terms", "Monomial, binomial, polynomial operations"], TB_MATH_7),
        ch("m7_c7", 7, "Ch 7: Construction of Angles with Compass", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u0995\u09AE\u09CD\u09AA\u09BE\u09B8\u09C7\u09B0 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF\u09C7 \u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u0995\u09CB\u09A3 \u0985\u0999\u09CD\u0995\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u092A\u0930\u0915\u093E\u0930 \u0915\u0940 \u0938\u0939\u093E\u092F\u0924\u093E \u0938\u0947 \u0915\u094B\u0923\u094B\u0902 \u0915\u0940 \u0930\u091A\u0928\u093E", ["Constructing 60\xB0, 30\xB0, 15\xB0, 90\xB0, 45\xB0, 75\xB0, 105\xB0, 120\xB0, 135\xB0"], TB_MATH_7),
        ch("m7_c8", 8, "Ch 8: Construction of Triangles", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09A4\u09CD\u09B0\u09BF\u09AD\u09C1\u099C \u0985\u0999\u09CD\u0995\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u0924\u094D\u0930\u093F\u092D\u0941\u091C\u094B\u0902 \u0915\u0940 \u0930\u091A\u0928\u093E", ["Constructing triangles given SSS, SAS, ASA, and RHS criteria"], TB_MATH_7),
        ch("m7_c9", 9, "Ch 9: Concept of Congruency of Triangles", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u09B8\u09B0\u09CD\u09AC\u09B8\u09AE\u09A4\u09BE\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u0938\u0930\u094D\u0935\u093E\u0902\u0917\u0938\u092E\u0924\u093E \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["SSS, SAS, ASA, AAS, and RHS congruence conditions"], TB_MATH_7),
        ch("m7_c10", 10, "Ch 10: Approximation of Decimal Numbers", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E6: \u0986\u09B8\u09A8\u09CD\u09A8\u09AE\u09BE\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 10: \u0938\u0928\u094D\u0928\u093F\u0915\u091F \u092E\u093E\u0928", ["Rounding decimals to 1, 2, 3, or 4 decimal places", "Significant figures"], TB_MATH_7),
        ch("m7_c11", 11, "Ch 11: Square Root of Fractions & Decimals", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E7: \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6\u09C7\u09B0 \u09AC\u09B0\u09CD\u0997\u09AE\u09C2\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 11: \u092D\u093F\u0928\u094D\u0928\u094B\u0902 \u0914\u0930 \u0926\u0936\u092E\u0932\u0935\u094B\u0902 \u0915\u093E \u0935\u0930\u094D\u0917\u092E\u0942\u0932", ["Square root of vulgar fractions and decimals by division method"], TB_MATH_7),
        ch("m7_c12", 12, "Ch 12: Algebraic Formulae & Identities", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E8: \u09AC\u09C0\u099C\u0997\u09BE\u09A3\u09BF\u09A4\u09BF\u0995 \u09B8\u09C2\u09A4\u09CD\u09B0\u09BE\u09AC\u09B2\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 12: \u092C\u0940\u091C\u0940\u092F \u0938\u0942\u0924\u094D\u0930 \u0914\u0930 \u0938\u0930\u094D\u0935\u0938\u092E\u093F\u0915\u093E\u090F\u0901", ["(a+b)^2, (a-b)^2, a^2-b^2, (x+a)(x+b)", "Application of algebraic identities"], TB_MATH_7),
        ch("m7_c13", 13, "Ch 13: Parallel Lines & Transversal Concept", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E9: \u09B8\u09AE\u09BE\u09A8\u09CD\u09A4\u09B0\u09BE\u09B2 \u09B8\u09B0\u09B2\u09B0\u09C7\u0996\u09BE \u0993 \u099B\u09C7\u09A6\u0995\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 13: \u0938\u092E\u093E\u0902\u0924\u0930 \u0930\u0947\u0916\u093E\u090F\u0901 \u0914\u0930 \u0924\u093F\u0930\u094D\u092F\u0915 \u0930\u0947\u0916\u093E \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Corresponding, alternate interior, and co-interior angles"], TB_MATH_7),
        ch("m7_c14", 14, "Ch 14: Properties of a Triangle", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EA: \u09A4\u09CD\u09B0\u09BF\u09AD\u09C1\u099C\u09C7\u09B0 \u09A7\u09B0\u09CD\u09AE", "\u0905\u0927\u094D\u092F\u093E\u092F 14: \u0924\u094D\u0930\u093F\u092D\u0941\u091C \u0915\u0947 \u0917\u0941\u0923\u0927\u0930\u094D\u092E", ["Angle sum property (180\xB0)", "Exterior angle theorem", "Medians, altitudes, Pythagoras theorem intro"], TB_MATH_7),
        ch("m7_c15", 15, "Ch 15: Time and Distance", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EB: \u09B8\u09AE\u09AF\u09BC \u0993 \u09A6\u09C2\u09B0\u09A4\u09CD\u09AC", "\u0905\u0927\u094D\u092F\u093E\u092F 15: \u0938\u092E\u092F \u0914\u0930 \u0926\u0942\u0930\u0940", ["Speed = Distance / Time", "km/h to m/s conversion", "Train passing pole/platform problems"], TB_MATH_7),
        ch("m7_c16", 16, "Ch 16: Double Bar Graph", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EC: \u09A6\u09CD\u09AC\u09BF\u09B8\u09CD\u09A4\u09AE\u09CD\u09AD \u09B2\u09C7\u0996", "\u0905\u0927\u094D\u092F\u093E\u092F 16: \u0926\u094D\u0935\u093F-\u0926\u0902\u0921 \u0906\u0932\u0947\u0916", ["Comparing two datasets using double bar graphs"], TB_MATH_7),
        ch("m7_c17", 17, "Ch 17: Area of Rectangles and Squares", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09ED: \u0986\u09AF\u09BC\u09A4\u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0 \u0993 \u09AC\u09B0\u09CD\u0997\u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09C7\u09B0 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09AB\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 17: \u0906\u092F\u0924 \u0914\u0930 \u0935\u0930\u094D\u0917 \u0915\u093E \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092B\u0932", ["Area of paths inside/outside rectangular gardens", "Crossroads area"], TB_MATH_7),
        ch("m7_c18", 18, "Ch 18: Symmetry (Rotational & Line Symmetry)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EE: \u09AA\u09CD\u09B0\u09A4\u09BF\u09B8\u09BE\u09AE\u09CD\u09AF (\u09B0\u09C8\u0996\u09BF\u0995 \u0993 \u0998\u09C2\u09B0\u09CD\u09A3\u09A8 \u09AA\u09CD\u09B0\u09A4\u09BF\u09B8\u09BE\u09AE\u09CD\u09AF)", "\u0905\u0927\u094D\u092F\u093E\u092F 18: \u0938\u092E\u092E\u093F\u0924\u093F (\u0930\u0948\u0916\u093F\u0915 \u0914\u0930 \u0918\u0942\u0930\u094D\u0923\u0928 \u0938\u092E\u092E\u093F\u0924\u093F)", ["Order of rotational symmetry", "Angle of rotation", "Centre of rotation"], TB_MATH_7),
        ch("m7_c19", 19, "Ch 19: Factorization of Algebraic Expressions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EF: \u0989\u09CE\u09AA\u09BE\u09A6\u0995\u09C7 \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 19: \u092C\u0940\u091C\u0940\u092F \u0935\u094D\u092F\u0902\u091C\u0915\u094B\u0902 \u0915\u093E \u0917\u0941\u0923\u0928\u0916\u0902\u0921\u0928", ["Common factors, grouping, difference of two squares, trinomials"], TB_MATH_7),
        ch("m7_c20", 20, "Ch 20: Classification of Quadrilaterals", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E6: \u099A\u09A4\u09C1\u09B0\u09CD\u09AD\u09C1\u099C\u09C7\u09B0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09C0\u09AC\u09BF\u09AD\u09BE\u0997", "\u0905\u0927\u094D\u092F\u093E\u092F 20: \u091A\u0924\u0941\u0930\u094D\u092D\u0941\u091C\u094B\u0902 \u0915\u093E \u0935\u0930\u094D\u0917\u0940\u0915\u0930\u0923", ["Parallelogram, rectangle, rhombus, square, trapezium, kite properties"], TB_MATH_7),
        ch("m7_c21", 21, "Ch 21: Construction of Quadrilaterals", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E7: \u099A\u09A4\u09C1\u09B0\u09CD\u09AD\u09C1\u099C \u0985\u0999\u09CD\u0995\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 21: \u091A\u0924\u0941\u0930\u094D\u092D\u0941\u091C\u094B\u0902 \u0915\u0940 \u0930\u091A\u0928\u093E", ["Constructing quadrilaterals, squares, rectangles, parallelograms"], TB_MATH_7),
        ch("m7_c22", 22, "Ch 22: Formation and Solution of Linear Equations", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E8: \u09B8\u09AE\u09C0\u0995\u09B0\u09A3 \u0997\u09A0\u09A8 \u0993 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 22: \u0938\u092E\u0940\u0915\u0930\u0923 \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0914\u0930 \u0939\u0932", ["Solving linear equations in one variable", "Word problems on ages, numbers, geometry"], TB_MATH_7),
        ch("m7_c23", 23, "Ch 23: Mathematical Fun & Number Puzzles", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E9: \u09AE\u099C\u09BE\u09B0 \u0985\u0999\u09CD\u0995", "\u0905\u0927\u094D\u092F\u093E\u092F 23: \u092E\u091C\u0947\u0926\u093E\u0930 \u0917\u0923\u093F\u0924 \u0914\u0930 \u092A\u0939\u0947\u0932\u093F\u092F\u093E\u0901", ["Magic squares", "Fibonacci numbers", "Divisibility and pattern puzzles"], TB_MATH_7)
      ]
    },
    8: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_MATH_8,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Ganit Prabha Class VIII (Chapters 1\u201323)",
      boardNote: {
        en: "Official WBBSE Class VIII Ganit Prabha \u2014 All 23 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0997\u09A3\u09BF\u09A4 \u09AA\u09CD\u09B0\u09AD\u09BE \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E8\u09E9\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 8 \u0917\u0923\u093F\u0924 \u092A\u094D\u0930\u092D\u093E \u2014 \u0938\u092D\u0940 23 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("m8_c1", 1, "Ch 1: Revision of Previous Lessons (Area, Perimeter & Algebra)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AA\u09C2\u09B0\u09CD\u09AC\u09AA\u09BE\u09A0\u09C7\u09B0 \u09AA\u09C1\u09A8\u09B0\u09BE\u09B2\u09CB\u099A\u09A8\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092A\u0942\u0930\u094D\u0935 \u092A\u093E\u0920 \u0915\u0940 \u092A\u0941\u0928\u0930\u093E\u0935\u0943\u0924\u094D\u0924\u093F", ["Mensuration of 2D shapes", "Algebraic identities review"], TB_MATH_8),
        ch("m8_c2", 2, "Ch 2: Pie Chart", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09AA\u09BE\u0987 \u099A\u09BF\u09A4\u09CD\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u092A\u093E\u0908 \u091A\u093E\u0930\u094D\u091F (\u0935\u0943\u0924\u094D\u0924 \u0906\u0932\u0947\u0916)", ["Central angle calculation (fraction \xD7 360\xB0)", "Interpreting and constructing pie charts"], TB_MATH_8),
        ch("m8_c3", 3, "Ch 3: Rational Numbers", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AE\u09C2\u09B2\u09A6 \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u092A\u0930\u093F\u092E\u0947\u092F \u0938\u0902\u0916\u094D\u092F\u093E\u0913\u0902 \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Representation as p/q", "Properties of rational numbers", "Finding rational numbers between two numbers"], TB_MATH_8),
        ch("m8_c4", 4, "Ch 4: Multiplication & Division of Polynomials", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09AC\u09B9\u09C1\u09AA\u09A6\u09C0 \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09AE\u09BE\u09B2\u09BE\u09B0 \u0997\u09C1\u09A3 \u0993 \u09AD\u09BE\u0997", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u092C\u0939\u0941\u092A\u0926\u094B\u0902 \u0915\u093E \u0917\u0941\u0923\u093E \u0914\u0930 \u092D\u093E\u0917", ["Long division of polynomials", "Division algorithm"], TB_MATH_8),
        ch("m8_c5", 5, "Ch 5: Cubes and Cube Roots", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u0998\u09A8\u09AB\u09B2 \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC \u0993 \u0998\u09A8\u09AE\u09C2\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u0918\u0928 \u0914\u0930 \u0918\u0928\u092E\u0942\u0932", ["Perfect cubes", "Cube root by prime factorization", "(a+b)^3 and (a-b)^3 identities, a^3+b^3, a^3-b^3"], TB_MATH_8),
        ch("m8_c6", 6, "Ch 6: Complementary, Supplementary & Adjacent Angles", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09AA\u09C2\u09B0\u0995 \u0995\u09CB\u09A3, \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u0995 \u0995\u09CB\u09A3 \u0993 \u09B8\u09A8\u09CD\u09A8\u09BF\u09B9\u09BF\u09A4 \u0995\u09CB\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u092A\u0942\u0930\u0915 \u0915\u094B\u0923, \u0938\u0902\u092A\u0942\u0930\u0915 \u0915\u094B\u0923 \u0914\u0930 \u0906\u0938\u0928\u094D\u0928 \u0915\u094B\u0923", ["Complementary (90\xB0)", "Supplementary (180\xB0)", "Vertically opposite angles theorem"], TB_MATH_8),
        ch("m8_c7", 7, "Ch 7: Concept of Vertically Opposite Angles & Parallel Lines", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09AC\u09BF\u09AA\u09CD\u09B0\u09A4\u09C0\u09AA \u0995\u09CB\u09A3\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u0936\u0940\u0930\u094D\u0937\u093E\u092D\u093F\u092E\u0941\u0916 \u0915\u094B\u0923\u094B\u0902 \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Proof that vertically opposite angles are equal", "Intersecting lines"], TB_MATH_8),
        ch("m8_c8", 8, "Ch 8: Properties of Parallel Lines and Transversal", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09B8\u09AE\u09BE\u09A8\u09CD\u09A4\u09B0\u09BE\u09B2 \u09B8\u09B0\u09B2\u09B0\u09C7\u0996\u09BE \u0993 \u099B\u09C7\u09A6\u0995\u09C7\u09B0 \u09A7\u09B0\u09CD\u09AE", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u0938\u092E\u093E\u0902\u0924\u0930 \u0930\u0947\u0916\u093E\u0913\u0902 \u0914\u0930 \u0924\u093F\u0930\u094D\u092F\u0915 \u0930\u0947\u0916\u093E \u0915\u0947 \u0917\u0941\u0923\u0927\u0930\u094D\u092E", ["Alternate, corresponding, interior angles theorems and applications"], TB_MATH_8),
        ch("m8_c9", 9, "Ch 9: Relation Between Two Sides of a Triangle & Their Opposite Angles", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u09A4\u09CD\u09B0\u09BF\u09AD\u09C1\u099C\u09C7\u09B0 \u09A6\u09C1\u099F\u09BF \u09AC\u09BE\u09B9\u09C1 \u0993 \u09A4\u09BE\u09A6\u09C7\u09B0 \u09AC\u09BF\u09AA\u09B0\u09C0\u09A4 \u0995\u09CB\u09A3\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u0924\u094D\u0930\u093F\u092D\u0941\u091C \u0915\u0940 \u0926\u094B \u092D\u0941\u091C\u093E\u0913\u0902 \u0914\u0930 \u0909\u0928\u0915\u0947 \u0938\u092E\u094D\u092E\u0941\u0916 \u0915\u094B\u0923\u094B\u0902 \u0915\u093E \u0938\u0902\u092C\u0902\u0927", ["Angles opposite to equal sides of an isosceles triangle are equal", "Inequality relations"], TB_MATH_8),
        ch("m8_c10", 10, "Ch 10: Rule of Three (Direct & Inverse Variation)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E6: \u09A4\u09CD\u09B0\u09C8\u09B0\u09BE\u09B6\u09BF\u0995", "\u0905\u0927\u094D\u092F\u093E\u092F 10: \u0924\u094D\u0930\u0948\u0930\u093E\u0936\u093F\u0915 \u0928\u093F\u092F\u092E", ["Direct and inverse variation setup using proportions", "Compound rule of three"], TB_MATH_8),
        ch("m8_c11", 11, "Ch 11: Percentage", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E7: \u09B6\u09A4\u0995\u09B0\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 11: \u092A\u094D\u0930\u0924\u093F\u0936\u0924", ["Percentage increase/decrease", "Successive percentage changes", "Applied problems"], TB_MATH_8),
        ch("m8_c12", 12, "Ch 12: Mixture (Ratio of Mixtures)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E8: \u09AE\u09BF\u09B6\u09CD\u09B0\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 12: \u092E\u093F\u0936\u094D\u0930\u0923", ["Mixing two or more components in given ratios", "Alligation and replacement problems"], TB_MATH_8),
        ch("m8_c13", 13, "Ch 13: Factorization of Algebraic Expressions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E9: \u09AC\u09C0\u099C\u0997\u09BE\u09A3\u09BF\u09A4\u09BF\u0995 \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09AE\u09BE\u09B2\u09BE\u09B0 \u0989\u09CE\u09AA\u09BE\u09A6\u0995\u09C7 \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 13: \u092C\u0940\u091C\u0940\u092F \u0935\u094D\u092F\u0902\u091C\u0915\u094B\u0902 \u0915\u093E \u0917\u0941\u0923\u0928\u0916\u0902\u0921\u0928", ["Middle-term splitting", "Cubic identities factorization"], TB_MATH_8),
        ch("m8_c14", 14, "Ch 14: HCF and LCM of Algebraic Expressions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EA: \u09AC\u09C0\u099C\u0997\u09BE\u09A3\u09BF\u09A4\u09BF\u0995 \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09AE\u09BE\u09B2\u09BE\u09B0 \u0997.\u09B8\u09BE.\u0997\u09C1. \u0993 \u09B2.\u09B8\u09BE.\u0997\u09C1.", "\u0905\u0927\u094D\u092F\u093E\u092F 14: \u092C\u0940\u091C\u0940\u092F \u0935\u094D\u092F\u0902\u091C\u0915\u094B\u0902 \u0915\u093E \u092E.\u0938.\u092A. \u0914\u0930 \u0932.\u0938.\u092A.", ["Finding HCF and LCM of polynomials by factorization"], TB_MATH_8),
        ch("m8_c15", 15, "Ch 15: Simplification of Algebraic Fractions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EB: \u09AC\u09C0\u099C\u0997\u09BE\u09A3\u09BF\u09A4\u09BF\u0995 \u09AD\u0997\u09CD\u09A8\u09BE\u0982\u09B6\u09C7\u09B0 \u09B8\u09B0\u09B2\u09C0\u0995\u09B0\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 15: \u092C\u0940\u091C\u0940\u092F \u092D\u093F\u0928\u094D\u0928\u094B\u0902 \u0915\u093E \u0938\u0930\u0932\u0940\u0915\u0930\u0923", ["Reducing rational expressions", "Addition, subtraction, multiplication, division of algebraic fractions"], TB_MATH_8),
        ch("m8_c16", 16, "Ch 16: Verification of Relation Between Angles & Sides of a Triangle", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EC: \u09A4\u09CD\u09B0\u09BF\u09AD\u09C1\u099C\u09C7\u09B0 \u0995\u09CB\u09A3 \u0993 \u09AC\u09BE\u09B9\u09C1\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7\u09B0 \u09AF\u09BE\u099A\u09BE\u0987", "\u0905\u0927\u094D\u092F\u093E\u092F 16: \u0924\u094D\u0930\u093F\u092D\u0941\u091C \u0915\u0947 \u0915\u094B\u0923\u094B\u0902 \u0914\u0930 \u092D\u0941\u091C\u093E\u0913\u0902 \u0915\u0947 \u0938\u0902\u092C\u0902\u0927 \u0915\u093E \u0938\u0924\u094D\u092F\u093E\u092A\u0928", ["Sum of three angles is 180\xB0", "Exterior angle = sum of interior opposite angles", "Triangle inequality a + b > c"], TB_MATH_8),
        ch("m8_c17", 17, "Ch 17: Time and Work", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09ED: \u09B8\u09AE\u09AF\u09BC \u0993 \u0995\u09BE\u09B0\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 17: \u0938\u092E\u092F \u0914\u0930 \u0915\u093E\u0930\u094D\u092F", ["Work rate and efficiency", "Pipes and cisterns", "Combined work problems"], TB_MATH_8),
        ch("m8_c18", 18, "Ch 18: Graphs (Cartesian Plane & Linear Graphs)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EE: \u09B2\u09C7\u0996\u099A\u09BF\u09A4\u09CD\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 18: \u0906\u0932\u0947\u0916 (\u0917\u094D\u0930\u093E\u092B\u093C)", ["Coordinate axes, quadrants, plotting points (x, y)", "Drawing linear graphs"], TB_MATH_8),
        ch("m8_c19", 19, "Ch 19: Formation and Solution of Equations", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EF: \u09B8\u09AE\u09C0\u0995\u09B0\u09A3 \u0997\u09A0\u09A8 \u0993 \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 19: \u0938\u092E\u0940\u0915\u0930\u0923 \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0914\u0930 \u0939\u0932", ["Linear equations with fractional coefficients", "Word problems"], TB_MATH_8),
        ch("m8_c20", 20, "Ch 20: Geometrical Proofs (Polygons & Interior/Exterior Angles)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E6: \u099C\u09CD\u09AF\u09BE\u09AE\u09BF\u09A4\u09BF\u0995 \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3 (\u09AC\u09B9\u09C1\u09AD\u09C1\u099C\u09C7\u09B0 \u0985\u09A8\u09CD\u09A4\u0983\u0995\u09CB\u09A3 \u0993 \u09AC\u09B9\u09BF\u0983\u0995\u09CB\u09A3)", "\u0905\u0927\u094D\u092F\u093E\u092F 20: \u091C\u094D\u092F\u093E\u092E\u093F\u0924\u0940\u092F \u092A\u094D\u0930\u092E\u093E\u0923 (\u092C\u0939\u0941\u092D\u0941\u091C \u0915\u0947 \u0905\u0902\u0924\u0903\u0915\u094B\u0923 \u0914\u0930 \u092C\u0939\u093F\u0937\u094D\u0915\u094B\u0923)", ["Sum of interior angles of n-gon = 2(n-2)\xD790\xB0", "Sum of exterior angles = 360\xB0"], TB_MATH_8),
        ch("m8_c21", 21, "Ch 21: Construction of Triangles", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E7: \u09A4\u09CD\u09B0\u09BF\u09AD\u09C1\u099C \u0985\u0999\u09CD\u0995\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 21: \u0924\u094D\u0930\u093F\u092D\u0941\u091C\u094B\u0902 \u0915\u0940 \u0930\u091A\u0928\u093E", ["Advanced triangle constructions and dividing a line segment into equal parts"], TB_MATH_8),
        ch("m8_c22", 22, "Ch 22: Drawing Parallel Lines", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E8: \u09B8\u09AE\u09BE\u09A8\u09CD\u09A4\u09B0\u09BE\u09B2 \u09B8\u09B0\u09B2\u09B0\u09C7\u0996\u09BE \u0985\u0999\u09CD\u0995\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 22: \u0938\u092E\u093E\u0902\u0924\u0930 \u0930\u0947\u0916\u093E\u0913\u0902 \u0915\u0940 \u0930\u091A\u0928\u093E", ["Constructing a line parallel to a given line through an external point"], TB_MATH_8),
        ch("m8_c23", 23, "Ch 23: Dividing a Line Segment into Equal Parts & Fun with Numbers", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E9: \u09AA\u09CD\u09B0\u09A6\u09A4\u09CD\u09A4 \u09B8\u09B0\u09B2\u09B0\u09C7\u0996\u09BE\u0982\u09B6\u0995\u09C7 \u09B8\u09AE\u09BE\u09A8 \u09AD\u09BE\u0997\u09C7 \u09AC\u09BF\u09AD\u0995\u09CD\u09A4 \u0995\u09B0\u09BE \u0993 \u09AE\u099C\u09BE\u09B0 \u0985\u0999\u09CD\u0995", "\u0905\u0927\u094D\u092F\u093E\u092F 23: \u0926\u093F\u090F \u0917\u090F \u0930\u0947\u0916\u093E\u0916\u0902\u0921 \u0915\u094B \u092C\u0930\u093E\u092C\u0930 \u092D\u093E\u0917\u094B\u0902 \u092E\u0947\u0902 \u092C\u093E\u0901\u091F\u0928\u093E \u0914\u0930 \u092E\u091C\u0947\u0926\u093E\u0930 \u0917\u0923\u093F\u0924", ["Dividing a line segment into 3 or 5 equal parts", "Divisibility and cryptarithms"], TB_MATH_8)
      ]
    },
    9: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_MATH_9,
      syllabusVersion: "WBBSE Secondary Curriculum (Current Edition)",
      officialSource: "WBBSE \u2014 Ganit Prakash Class IX (Chapters 1\u201321)",
      boardNote: {
        en: "Official WBBSE Class IX Ganit Prakash \u2014 All 21 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0997\u09A3\u09BF\u09A4 \u09AA\u09CD\u09B0\u0995\u09BE\u09B6 \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E8\u09E7\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 9 \u0917\u0923\u093F\u0924 \u092A\u094D\u0930\u0915\u093E\u0936 \u2014 \u0938\u092D\u0940 21 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("m9_c1", 1, "Ch 1: Real Numbers", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AC\u09BE\u09B8\u09CD\u09A4\u09AC \u09B8\u0982\u0996\u09CD\u09AF\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u0938\u0902\u0916\u094D\u092F\u093E\u090F\u0901", ["Rational and irrational numbers", "Decimal expansions", "Representing \u221A2, \u221A3, \u221A5 on number line"], TB_MATH_9),
        ch("m9_c2", 2, "Ch 2: Laws of Indices", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09B8\u09C2\u099A\u0995\u09C7\u09B0 \u09A8\u09BF\u09AF\u09BC\u09AE\u09BE\u09AC\u09B2\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u0918\u093E\u0924\u093E\u0902\u0915 \u0915\u0947 \u0928\u093F\u092F\u092E", ["Integral and fractional indices", "Exponential equations"], TB_MATH_9),
        ch("m9_c3", 3, "Ch 3: Graph", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09B2\u09C7\u0996\u099A\u09BF\u09A4\u09CD\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u0906\u0932\u0947\u0916 (\u0917\u094D\u0930\u093E\u092B\u093C)", ["Plotting linear equations in two variables", "Graphical solution of simultaneous equations"], TB_MATH_9),
        ch("m9_c4", 4, "Ch 4: Coordinate Geometry \u2014 Distance Formula", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09B8\u09CD\u09A5\u09BE\u09A8\u09BE\u0999\u09CD\u0995 \u099C\u09CD\u09AF\u09BE\u09AE\u09BF\u09A4\u09BF: \u09A6\u09C2\u09B0\u09A4\u09CD\u09AC \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093E\u0902\u0915 \u091C\u094D\u092F\u093E\u092E\u093F\u0924\u093F: \u0926\u0942\u0930\u0940 \u0938\u0942\u0924\u094D\u0930", ["Distance between (x1, y1) and (x2, y2)", "Collinearity and triangle/quadrilateral type verification"], TB_MATH_9),
        ch("m9_c5", 5, "Ch 5: Linear Simultaneous Equations (Two Variables)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09B0\u09C8\u0996\u09BF\u0995 \u09B8\u09B9\u09B8\u09AE\u09C0\u0995\u09B0\u09A3 (\u09A6\u09C1\u0987 \u099A\u09B2\u09AC\u09BF\u09B6\u09BF\u09B7\u09CD\u099F)", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u0926\u094B \u091A\u0930\u094B\u0902 \u0935\u093E\u0932\u0947 \u0930\u0948\u0916\u093F\u0915 \u092F\u0941\u0917\u092A\u0924 \u0938\u092E\u0940\u0915\u0930\u0923", ["Elimination, substitution, comparison, and cross-multiplication methods", "Consistency conditions"], TB_MATH_9),
        ch("m9_c6", 6, "Ch 6: Properties of Parallelogram", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09B8\u09BE\u09AE\u09BE\u09A8\u09CD\u09A4\u09B0\u09BF\u0995\u09C7\u09B0 \u09A7\u09B0\u09CD\u09AE", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u0938\u092E\u093E\u0902\u0924\u0930 \u091A\u0924\u0941\u0930\u094D\u092D\u0941\u091C \u0915\u0947 \u0917\u0941\u0923\u0927\u0930\u094D\u092E", ["Opposite sides and angles equal", "Diagonals bisect each other", "Conditions for parallelogram"], TB_MATH_9),
        ch("m9_c7", 7, "Ch 7: Polynomials", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09AC\u09B9\u09C1\u09AA\u09A6\u09C0 \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09AE\u09BE\u09B2\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u092C\u0939\u0941\u092A\u0926", ["Degree, zeroes of a polynomial", "Remainder Theorem", "Factor Theorem"], TB_MATH_9),
        ch("m9_c8", 8, "Ch 8: Factorization", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u0989\u09CE\u09AA\u09BE\u09A6\u0995\u09C7 \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u0917\u0941\u0923\u0928\u0916\u0902\u0921\u0928", ["Vanishing method (Trial method)", "a^3 + b^3 + c^3 - 3abc identity"], TB_MATH_9),
        ch("m9_c9", 9, "Ch 9: Transversal & Mid-Point Theorem", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u09AD\u09C7\u09A6\u0995 \u0993 \u09AE\u09A7\u09CD\u09AF\u09AC\u09BF\u09A8\u09CD\u09A6\u09C1 \u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u0989\u09AA\u09AA\u09BE\u09A6\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u0924\u093F\u0930\u094D\u092F\u0915 \u0930\u0947\u0916\u093E \u0914\u0930 \u092E\u0927\u094D\u092F-\u092C\u093F\u0902\u0926\u0941 \u092A\u094D\u0930\u092E\u0947\u092F", ["Line joining mid-points of two sides of a triangle is parallel to third side and half of it", "Equal intercepts theorem"], TB_MATH_9),
        ch("m9_c10", 10, "Ch 10: Profit and Loss", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E6: \u09B2\u09BE\u09AD \u0993 \u0995\u09CD\u09B7\u09A4\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 10: \u0932\u093E\u092D \u0914\u0930 \u0939\u093E\u0928\u093F", ["Cost price, selling price, marked price, discount", "Successive discounts and profit/loss percentage"], TB_MATH_9),
        ch("m9_c11", 11, "Ch 11: Statistics (Frequency Distribution, Histogram & Frequency Polygon)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E7: \u09B0\u09BE\u09B6\u09BF\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 11: \u0938\u093E\u0902\u0916\u094D\u092F\u093F\u0915\u0940", ["Cumulative frequency", "Class boundaries, class mark", "Histogram and Frequency Polygon"], TB_MATH_9),
        ch("m9_c12", 12, "Ch 12: Theorems on Area", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E8: \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09AB\u09B2 \u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u0989\u09AA\u09AA\u09BE\u09A6\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 12: \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092B\u0932 \u0938\u0902\u092C\u0902\u0927\u0940 \u092A\u094D\u0930\u092E\u0947\u092F", ["Parallelograms and triangles on the same base and between the same parallels"], TB_MATH_9),
        ch("m9_c13", 13, "Ch 13: Construction \u2014 Parallelogram & Triangle of Equal Area", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E9: \u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u09CD\u09AF: \u09A4\u09CD\u09B0\u09BF\u09AD\u09C1\u099C\u09C7\u09B0 \u09B8\u09AE\u09BE\u09A8 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09AB\u09B2\u09AC\u09BF\u09B6\u09BF\u09B7\u09CD\u099F \u09B8\u09BE\u09AE\u09BE\u09A8\u09CD\u09A4\u09B0\u09BF\u0995 \u0993 \u099A\u09A4\u09C1\u09B0\u09CD\u09AD\u09C1\u099C\u09C7\u09B0 \u09B8\u09AE\u09BE\u09A8 \u09A4\u09CD\u09B0\u09BF\u09AD\u09C1\u099C \u0985\u0999\u09CD\u0995\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 13: \u0930\u091A\u0928\u093E: \u0938\u092E\u093E\u0928 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092B\u0932 \u0935\u093E\u0932\u0947 \u0938\u092E\u093E\u0902\u0924\u0930 \u091A\u0924\u0941\u0930\u094D\u092D\u0941\u091C \u0914\u0930 \u0924\u094D\u0930\u093F\u092D\u0941\u091C \u0915\u0940 \u0930\u091A\u0928\u093E", ["Constructing a parallelogram equal in area to a triangle", "Constructing a triangle equal in area to a quadrilateral"], TB_MATH_9),
        ch("m9_c14", 14, "Ch 14: Mensuration \u2014 Perimeter & Area of Triangle and Quadrilateral", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EA: \u09AA\u09B0\u09BF\u09AE\u09BF\u09A4\u09BF: \u09A4\u09CD\u09B0\u09BF\u09AD\u09C1\u099C \u0993 \u099A\u09A4\u09C1\u09B0\u09CD\u09AD\u09C1\u099C\u09C7\u09B0 \u09AA\u09B0\u09BF\u09B8\u09C0\u09AE\u09BE \u0993 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09AB\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 14: \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092E\u093F\u0924\u093F: \u0924\u094D\u0930\u093F\u092D\u0941\u091C \u0914\u0930 \u091A\u0924\u0941\u0930\u094D\u092D\u0941\u091C \u0915\u093E \u092A\u0930\u093F\u092E\u093E\u092A \u090F\u0935\u0902 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092B\u0932", ["Heron's formula", "Area of equilateral and isosceles triangles", "Area of parallelogram, rhombus, trapezium"], TB_MATH_9),
        ch("m9_c15", 15, "Ch 15: Mensuration \u2014 Circumference of Circle", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EB: \u09AC\u09C3\u09A4\u09CD\u09A4\u09C7\u09B0 \u09AA\u09B0\u09BF\u09A7\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 15: \u0935\u0943\u0924\u094D\u0924 \u0915\u0940 \u092A\u0930\u093F\u0927\u093F", ["Circumference C = 2\u03C0r", "Revolution of wheels and circular track problems"], TB_MATH_9),
        ch("m9_c16", 16, "Ch 16: Mensuration \u2014 Area of Circle", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EC: \u09AC\u09C3\u09A4\u09CD\u09A4\u09C7\u09B0 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09AB\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 16: \u0935\u0943\u0924\u094D\u0924 \u0915\u093E \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092B\u0932", ["Area A = \u03C0r^2", "Area of circular ring and sector"], TB_MATH_9),
        ch("m9_c17", 17, "Ch 17: Theorems on Concurrence", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09ED: \u09B8\u09AE\u09AC\u09BF\u09A8\u09CD\u09A6\u09C1 \u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u0989\u09AA\u09AA\u09BE\u09A6\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 17: \u0938\u0902\u0917\u093E\u092E\u0940 \u0930\u0947\u0916\u093E\u0913\u0902 \u0938\u0902\u092C\u0902\u0927\u0940 \u092A\u094D\u0930\u092E\u0947\u092F", ["Concurrency of perpendicular bisectors (circumcentre), altitudes (orthocentre), angle bisectors (incentre), and medians (centroid 2:1)"], TB_MATH_9),
        ch("m9_c18", 18, "Ch 18: Coordinate Geometry \u2014 Internal & External Division of Line Segment", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EE: \u09B8\u09CD\u09A5\u09BE\u09A8\u09BE\u0999\u09CD\u0995 \u099C\u09CD\u09AF\u09BE\u09AE\u09BF\u09A4\u09BF: \u09B8\u09B0\u09B2\u09B0\u09C7\u0996\u09BE\u0982\u09B6\u09C7\u09B0 \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09AC\u09BF\u09AD\u0995\u09CD\u09A4 \u0993 \u09AC\u09B9\u09BF\u09B0\u09CD\u09AC\u09BF\u09AD\u0995\u09CD\u09A4", "\u0905\u0927\u094D\u092F\u093E\u092F 18: \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093E\u0902\u0915 \u091C\u094D\u092F\u093E\u092E\u093F\u0924\u093F: \u0930\u0947\u0916\u093E\u0916\u0902\u0921 \u0915\u093E \u0905\u0902\u0924\u0903 \u090F\u0935\u0902 \u092C\u093E\u0939\u094D\u092F \u0935\u093F\u092D\u093E\u091C\u0928", ["Section formula (mx2 \xB1 nx1)/(m \xB1 n)", "Mid-point formula"], TB_MATH_9),
        ch("m9_c19", 19, "Ch 19: Coordinate Geometry \u2014 Area of Triangular Region", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EF: \u09B8\u09CD\u09A5\u09BE\u09A8\u09BE\u0999\u09CD\u0995 \u099C\u09CD\u09AF\u09BE\u09AE\u09BF\u09A4\u09BF: \u09A4\u09CD\u09B0\u09BF\u09AD\u09C1\u099C\u09BE\u0995\u09C3\u09A4\u09BF \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09C7\u09B0 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09AB\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 19: \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093E\u0902\u0915 \u091C\u094D\u092F\u093E\u092E\u093F\u0924\u093F: \u0924\u094D\u0930\u093F\u092D\u0941\u091C\u093E\u0915\u093E\u0930 \u0915\u094D\u0937\u0947\u0924\u094D\u0930 \u0915\u093E \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092B\u0932", ["Area of triangle from vertex coordinates", "Centroid coordinates ((x1+x2+x3)/3, (y1+y2+y3)/3)", "Condition for collinearity"], TB_MATH_9),
        ch("m9_c20", 20, "Ch 20: Logarithm", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E6: \u09B2\u0997\u09BE\u09B0\u09BF\u09A6\u09AE", "\u0905\u0927\u094D\u092F\u093E\u092F 20: \u0932\u0918\u0941\u0917\u0923\u0915 (Logarithm)", ["Definition of log_a(x)", "Product, quotient, power, and base-change laws of logarithms"], TB_MATH_9),
        ch("m9_c21", 21, "Ch 21: Set Theory (Enrichment / Foundation)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E7: \u09B8\u09C7\u099F \u09A4\u09A4\u09CD\u09A4\u09CD\u09AC\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 21: \u0938\u092E\u0941\u091A\u094D\u091A\u092F \u0938\u093F\u0926\u094D\u0927\u093E\u0902\u0924 \u0915\u0940 \u092A\u094D\u0930\u093E\u0930\u0902\u092D\u093F\u0915 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Roster and set-builder forms", "Subsets, union, intersection, Venn diagrams"], TB_MATH_9)
      ]
    },
    10: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_MATH_10,
      syllabusVersion: "WBBSE Madhyamik Pariksha Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Ganit Prakash Class X (Chapters 1\u201326)",
      boardNote: {
        en: "Official WBBSE Class X Ganit Prakash (Madhyamik Pariksha) \u2014 All 26 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0997\u09A3\u09BF\u09A4 \u09AA\u09CD\u09B0\u0995\u09BE\u09B6 (\u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995) \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E8\u09EC\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 10 \u0917\u0923\u093F\u0924 \u092A\u094D\u0930\u0915\u093E\u0936 (\u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E) \u2014 \u0938\u092D\u0940 26 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("m10_c1", 1, "Ch 1: Quadratic Equations with One Variable", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u098F\u0995\u099A\u09B2\u09AC\u09BF\u09B6\u09BF\u09B7\u09CD\u099F \u09A6\u09CD\u09AC\u09BF\u0998\u09BE\u09A4 \u09B8\u09AE\u09C0\u0995\u09B0\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u090F\u0915 \u091A\u0930 \u0935\u093E\u0932\u0947 \u0926\u094D\u0935\u093F\u0918\u093E\u0924 \u0938\u092E\u0940\u0915\u0930\u0923", ["ax^2 + bx + c = 0", "Sridhar Acharya formula", "Nature of roots & discriminant b^2 - 4ac", "Sum and product of roots"], TB_MATH_10),
        ch("m10_c2", 2, "Ch 2: Simple Interest", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09B8\u09B0\u09B2 \u09B8\u09C1\u09A6\u0995\u09B7\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u0938\u093E\u0927\u093E\u0930\u0923 \u092C\u094D\u092F\u093E\u091C", ["I = P\xD7R\xD7T / 100", "Principal, rate, time, and amount calculations"], TB_MATH_10),
        ch("m10_c3", 3, "Ch 3: Theorems Related to Circle", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AC\u09C3\u09A4\u09CD\u09A4 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09BF\u09A4 \u0989\u09AA\u09AA\u09BE\u09A6\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u0935\u0943\u0924\u094D\u0924 \u0938\u0947 \u0938\u0902\u092C\u0902\u0927\u093F\u0924 \u092A\u094D\u0930\u092E\u0947\u092F", ["Perpendicular from centre to chord bisects chord", "Equal chords are equidistant from centre"], TB_MATH_10),
        ch("m10_c4", 4, "Ch 4: Rectangular Parallelopiped or Cuboid", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u0986\u09AF\u09BC\u09A4\u0998\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u0906\u092F\u0924\u093E\u0915\u093E\u0930 \u0938\u092E\u093E\u0902\u0924\u0930 \u0937\u091F\u094D\u092B\u0932\u0915 \u092F\u093E \u0918\u0928\u093E\u092D", ["Total surface area, volume, and diagonal of cuboid and cube", "Area of four walls"], TB_MATH_10),
        ch("m10_c5", 5, "Ch 5: Ratio and Proportion", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u0985\u09A8\u09C1\u09AA\u09BE\u09A4 \u0993 \u09B8\u09AE\u09BE\u09A8\u09C1\u09AA\u09BE\u09A4", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u0905\u0928\u0941\u092A\u093E\u0924 \u0914\u0930 \u0938\u092E\u093E\u0928\u0941\u092A\u093E\u0924", ["Componendo-dividendo, alternendo, invertendo, addendo", "k-method proofs"], TB_MATH_10),
        ch("m10_c6", 6, "Ch 6: Compound Interest & Uniform Rate of Increase or Decrease", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u099A\u0995\u09CD\u09B0\u09AC\u09C3\u09A6\u09CD\u09A7\u09BF \u09B8\u09C1\u09A6 \u0993 \u09B8\u09AE\u09B9\u09BE\u09B0 \u09AC\u09C3\u09A6\u09CD\u09A7\u09BF \u09AC\u09BE \u09B9\u09CD\u09B0\u09BE\u09B8", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u091A\u0915\u094D\u0930\u0935\u0943\u0926\u094D\u0927\u093F \u092C\u094D\u092F\u093E\u091C \u0914\u0930 \u0938\u092E\u093E\u0928 \u0926\u0930 \u0938\u0947 \u0935\u0943\u0926\u094D\u0927\u093F \u092F\u093E \u0939\u094D\u0930\u093E\u0938", ["A = P(1 + r/100)^n", "Half-yearly and quarterly compounding", "Population growth and depreciation"], TB_MATH_10),
        ch("m10_c7", 7, "Ch 7: Theorems Related to Angles in a Circle", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09AC\u09C3\u09A4\u09CD\u09A4\u09B8\u09CD\u09A5 \u0995\u09CB\u09A3 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09BF\u09A4 \u0989\u09AA\u09AA\u09BE\u09A6\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u0935\u0943\u0924\u094D\u0924 \u0915\u0947 \u0915\u094B\u0923\u094B\u0902 \u0938\u0947 \u0938\u0902\u092C\u0902\u0927\u093F\u0924 \u092A\u094D\u0930\u092E\u0947\u092F", ["Angle at centre is double the angle at circumference", "Angles in the same segment are equal", "Angle in a semicircle is a right angle"], TB_MATH_10),
        ch("m10_c8", 8, "Ch 8: Right Circular Cylinder", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09B2\u09AE\u09CD\u09AC \u09AC\u09C3\u09A4\u09CD\u09A4\u09BE\u0995\u09BE\u09B0 \u099A\u09CB\u0999", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u0932\u0902\u092C \u0935\u0943\u0924\u094D\u0924\u0940\u092F \u092C\u0947\u0932\u0928", ["Curved surface area 2\u03C0rh", "Total surface area 2\u03C0r(r+h)", "Volume \u03C0r^2h", "Hollow cylinder"], TB_MATH_10),
        ch("m10_c9", 9, "Ch 9: Quadratic Surds", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u09A6\u09CD\u09AC\u09BF\u0998\u09BE\u09A4 \u0995\u09B0\u09A3\u09C0", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u0926\u094D\u0935\u093F\u0918\u093E\u0924 \u0915\u0930\u0923\u0940", ["Pure and mixed surds", "Conjugate surds", "Rationalization of denominator"], TB_MATH_10),
        ch("m10_c10", 10, "Ch 10: Theorems Related to Cyclic Quadrilateral", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E6: \u09AC\u09C3\u09A4\u09CD\u09A4\u09B8\u09CD\u09A5 \u099A\u09A4\u09C1\u09B0\u09CD\u09AD\u09C1\u099C \u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u0989\u09AA\u09AA\u09BE\u09A6\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 10: \u091A\u0915\u094D\u0930\u0940\u092F \u091A\u0924\u0941\u0930\u094D\u092D\u0941\u091C \u0938\u0902\u092C\u0902\u0927\u0940 \u092A\u094D\u0930\u092E\u0947\u092F", ["Opposite angles of a cyclic quadrilateral are supplementary (180\xB0)", "Exterior angle property"], TB_MATH_10),
        ch("m10_c11", 11, "Ch 11: Construction \u2014 Circumcircle and Incircle of a Triangle", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E7: \u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u09CD\u09AF: \u09A4\u09CD\u09B0\u09BF\u09AD\u09C1\u099C\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C3\u09A4\u09CD\u09A4 \u0993 \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09AC\u09C3\u09A4\u09CD\u09A4 \u0985\u0999\u09CD\u0995\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 11: \u0930\u091A\u0928\u093E: \u0924\u094D\u0930\u093F\u092D\u0941\u091C \u0915\u0947 \u092A\u0930\u093F\u0935\u0943\u0924\u094D\u0924 \u0914\u0930 \u0905\u0902\u0924\u0903\u0935\u0943\u0924\u094D\u0924 \u0915\u0940 \u0930\u091A\u0928\u093E", ["Constructing circumcentre & circumcircle", "Constructing incentre & incircle"], TB_MATH_10),
        ch("m10_c12", 12, "Ch 12: Sphere", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E8: \u0997\u09CB\u09B2\u0995", "\u0905\u0927\u094D\u092F\u093E\u092F 12: \u0917\u094B\u0932\u093E", ["Surface area of sphere 4\u03C0r^2", "Volume of sphere (4/3)\u03C0r^3", "Hemisphere curved and total surface area (2\u03C0r^2, 3\u03C0r^2)"], TB_MATH_10),
        ch("m10_c13", 13, "Ch 13: Variation", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E9: \u09AD\u09C7\u09A6", "\u0905\u0927\u094D\u092F\u093E\u092F 13: \u0935\u093F\u091A\u0930\u0923 (Variation)", ["Direct variation x \u221D y", "Inverse variation x \u221D 1/y", "Joint variation theorem"], TB_MATH_10),
        ch("m10_c14", 14, "Ch 14: Partnership Business", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EA: \u0985\u0982\u09B6\u09C0\u09A6\u09BE\u09B0\u09BF \u0995\u09BE\u09B0\u09AC\u09BE\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 14: \u0938\u093E\u091D\u0947\u0926\u093E\u0930\u0940 \u0935\u094D\u092F\u0935\u0938\u093E\u092F", ["Simple and compound partnership", "Profit distribution according to capital and time"], TB_MATH_10),
        ch("m10_c15", 15, "Ch 15: Theorems Related to Tangent to a Circle", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EB: \u09AC\u09C3\u09A4\u09CD\u09A4\u09C7\u09B0 \u09B8\u09CD\u09AA\u09B0\u09CD\u09B6\u0995 \u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u0989\u09AA\u09AA\u09BE\u09A6\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 15: \u0935\u0943\u0924\u094D\u0924 \u0915\u0940 \u0938\u094D\u092A\u0930\u094D\u0936 \u0930\u0947\u0916\u093E \u0938\u0902\u092C\u0902\u0927\u0940 \u092A\u094D\u0930\u092E\u0947\u092F", ["Tangent is perpendicular to radius at point of contact", "Tangents from external point are equal", "Touching circles"], TB_MATH_10),
        ch("m10_c16", 16, "Ch 16: Right Circular Cone", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EC: \u09B2\u09AE\u09CD\u09AC \u09AC\u09C3\u09A4\u09CD\u09A4\u09BE\u0995\u09BE\u09B0 \u09B6\u0999\u09CD\u0995\u09C1", "\u0905\u0927\u094D\u092F\u093E\u092F 16: \u0932\u0902\u092C \u0935\u0943\u0924\u094D\u0924\u0940\u092F \u0936\u0902\u0915\u0941", ["Slant height l = \u221A(r^2 + h^2)", "Curved surface area \u03C0rl", "Total surface area \u03C0r(r+l)", "Volume (1/3)\u03C0r^2h"], TB_MATH_10),
        ch("m10_c17", 17, "Ch 17: Construction \u2014 Tangents to a Circle", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09ED: \u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u09CD\u09AF: \u09AC\u09C3\u09A4\u09CD\u09A4\u09C7\u09B0 \u09B8\u09CD\u09AA\u09B0\u09CD\u09B6\u0995 \u0985\u0999\u09CD\u0995\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 17: \u0930\u091A\u0928\u093E: \u0935\u0943\u0924\u094D\u0924 \u0915\u0940 \u0938\u094D\u092A\u0930\u094D\u0936 \u0930\u0947\u0916\u093E\u0913\u0902 \u0915\u0940 \u0930\u091A\u0928\u093E", ["Constructing tangent at a point on circle and from an external point"], TB_MATH_10),
        ch("m10_c18", 18, "Ch 18: Similarity", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EE: \u09B8\u09A6\u09C3\u09B6\u09A4\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 18: \u0938\u092E\u0930\u0942\u092A\u0924\u093E", ["Thales Basic Proportionality Theorem", "AA, SAS, SSS similarity", "Right-angled triangle altitude similarity"], TB_MATH_10),
        ch("m10_c19", 19, "Ch 19: Problems on Different Solid Objects", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09EF: \u09AC\u09BF\u09AD\u09BF\u09A8\u09CD\u09A8 \u0998\u09A8\u09AC\u09B8\u09CD\u09A4\u09C1 \u09B8\u0982\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u09AC\u09BE\u09B8\u09CD\u09A4\u09AC \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 19: \u0935\u093F\u092D\u093F\u0928\u094D\u0928 \u0920\u094B\u0938 \u0935\u0938\u094D\u0924\u0941\u0913\u0902 \u0938\u0947 \u0938\u0902\u092C\u0902\u0927\u093F\u0924 \u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u0938\u092E\u0938\u094D\u092F\u093E\u090F\u0901", ["Melting and recasting solids (conservation of volume)", "Combination of solids"], TB_MATH_10),
        ch("m10_c20", 20, "Ch 20: Trigonometry \u2014 Concept of Measurement of Angle", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E6: \u09A4\u09CD\u09B0\u09BF\u0995\u09CB\u09A3\u09AE\u09BF\u09A4\u09BF: \u0995\u09CB\u09A3 \u09AA\u09B0\u09BF\u09AE\u09BE\u09AA\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 20: \u0924\u094D\u0930\u093F\u0915\u094B\u0923\u092E\u093F\u0924\u093F: \u0915\u094B\u0923 \u092E\u093E\u092A\u0928 \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Sexagesimal (degree, minute, second) and Circular (radian) systems", "\u03C0 radian = 180\xB0", "s = r\u03B8"], TB_MATH_10),
        ch("m10_c21", 21, "Ch 21: Construction \u2014 Determination of Mean Proportional", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E7: \u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u09CD\u09AF: \u09AE\u09A7\u09CD\u09AF\u09B8\u09AE\u09BE\u09A8\u09C1\u09AA\u09BE\u09A4\u09C0 \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC", "\u0905\u0927\u094D\u092F\u093E\u092F 21: \u0930\u091A\u0928\u093E: \u092E\u0927\u094D\u092F\u093E\u0928\u0941\u092A\u093E\u0924\u0940 \u0915\u093E \u0928\u093F\u0930\u094D\u0927\u093E\u0930\u0923", ["Geometric mean construction \u221Aab", "Constructing a square equal in area to a rectangle/triangle"], TB_MATH_10),
        ch("m10_c22", 22, "Ch 22: Pythagoras Theorem", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E8: \u09AA\u09BF\u09A5\u09BE\u0997\u09CB\u09B0\u09BE\u09B8\u09C7\u09B0 \u0989\u09AA\u09AA\u09BE\u09A6\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 22: \u092A\u093E\u0907\u0925\u093E\u0917\u094B\u0930\u0938 \u092A\u094D\u0930\u092E\u0947\u092F", ["Proof of Pythagoras theorem and its converse using similarity", "Geometric applications"], TB_MATH_10),
        ch("m10_c23", 23, "Ch 23: Trigonometric Ratios and Trigonometric Identities", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09E9: \u09A4\u09CD\u09B0\u09BF\u0995\u09CB\u09A3\u09AE\u09BF\u09A4\u09BF\u0995 \u0985\u09A8\u09C1\u09AA\u09BE\u09A4 \u098F\u09AC\u0982 \u09A4\u09CD\u09B0\u09BF\u0995\u09CB\u09A3\u09AE\u09BF\u09A4\u09BF\u0995 \u0985\u09AD\u09C7\u09A6\u09BE\u09AC\u09B2\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 23: \u0924\u094D\u0930\u093F\u0915\u094B\u0923\u092E\u093F\u0924\u0940\u092F \u0905\u0928\u0941\u092A\u093E\u0924 \u0914\u0930 \u0938\u0930\u094D\u0935\u0938\u092E\u093F\u0915\u093E\u090F\u0901", ["sin, cos, tan, cosec, sec, cot", "Standard angles (0\xB0, 30\xB0, 45\xB0, 60\xB0, 90\xB0)", "sin^2\u03B8 + cos^2\u03B8 = 1, sec^2\u03B8 - tan^2\u03B8 = 1, cosec^2\u03B8 - cot^2\u03B8 = 1"], TB_MATH_10),
        ch("m10_c24", 24, "Ch 24: Trigonometric Ratios of Complementary Angles", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09EA: \u09AA\u09C2\u09B0\u0995 \u0995\u09CB\u09A3\u09C7\u09B0 \u09A4\u09CD\u09B0\u09BF\u0995\u09CB\u09A3\u09AE\u09BF\u09A4\u09BF\u0995 \u0985\u09A8\u09C1\u09AA\u09BE\u09A4", "\u0905\u0927\u094D\u092F\u093E\u092F 24: \u092A\u0942\u0930\u0915 \u0915\u094B\u0923\u094B\u0902 \u0915\u0947 \u0924\u094D\u0930\u093F\u0915\u094B\u0923\u092E\u093F\u0924\u0940\u092F \u0905\u0928\u0941\u092A\u093E\u0924", ["sin(90\xB0-\u03B8) = cos\u03B8, tan(90\xB0-\u03B8) = cot\u03B8, sec(90\xB0-\u03B8) = cosec\u03B8"], TB_MATH_10),
        ch("m10_c25", 25, "Ch 25: Application of Trigonometric Ratios \u2014 Heights and Distances", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09EB: \u09A4\u09CD\u09B0\u09BF\u0995\u09CB\u09A3\u09AE\u09BF\u09A4\u09BF\u0995 \u0985\u09A8\u09C1\u09AA\u09BE\u09A4\u09C7\u09B0 \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u0997: \u0989\u099A\u09CD\u099A\u09A4\u09BE \u0993 \u09A6\u09C2\u09B0\u09A4\u09CD\u09AC", "\u0905\u0927\u094D\u092F\u093E\u092F 25: \u0924\u094D\u0930\u093F\u0915\u094B\u0923\u092E\u093F\u0924\u0940\u092F \u0905\u0928\u0941\u092A\u093E\u0924\u094B\u0902 \u0915\u093E \u0905\u0928\u0941\u092A\u094D\u0930\u092F\u094B\u0917: \u090A\u0901\u091A\u093E\u0908 \u0914\u0930 \u0926\u0942\u0930\u0940", ["Angle of elevation and angle of depression", "Tower, shadow, and two-object problems"], TB_MATH_10),
        ch("m10_c26", 26, "Ch 26: Statistics \u2014 Mean, Median, Ogive & Mode", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8\u09EC: \u09B0\u09BE\u09B6\u09BF\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8: \u0997\u09A1\u09BC, \u09AE\u09A7\u09CD\u09AF\u09AE\u09BE, \u0993\u099C\u09BE\u0987\u09AD \u0993 \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u0997\u09C1\u09B0\u09C1 \u09AE\u09BE\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 26: \u0938\u093E\u0902\u0916\u094D\u092F\u093F\u0915\u0940: \u092E\u093E\u0927\u094D\u092F, \u092E\u093E\u0927\u094D\u092F\u093F\u0915\u093E, \u0924\u094B\u0930\u0923 (Ogive) \u0914\u0930 \u092C\u0939\u0941\u0932\u0915", ["Direct, assumed mean, and step-deviation methods for Mean", "Median & Mode of grouped data", "Less-than and more-than Ogive"], TB_MATH_10)
      ]
    }
  }
};

// src/data/curriculumScience.ts
var TB_EVS_5 = {
  en: "Amader Paribesh (Class V \u2014 WBBPE)",
  bn: "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBPE)",
  hi: "\u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0930\u093F\u0935\u0947\u0936 (\u0915\u0915\u094D\u0937\u093E 5 \u2014 WBBPE)"
};
var TB_SCI_6 = {
  en: "Paribesh o Bigyan (Class VI \u2014 WBBSE)",
  bn: "\u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 (\u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 (\u0915\u0915\u094D\u0937\u093E 6 \u2014 WBBSE)"
};
var TB_SCI_7 = {
  en: "Paribesh o Bigyan (Class VII \u2014 WBBSE)",
  bn: "\u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 (\u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 (\u0915\u0915\u094D\u0937\u093E 7 \u2014 WBBSE)"
};
var TB_SCI_8 = {
  en: "Paribesh o Bigyan (Class VIII \u2014 WBBSE)",
  bn: "\u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 (\u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 (\u0915\u0915\u094D\u0937\u093E 8 \u2014 WBBSE)"
};
var TB_PS_9 = {
  en: "Bhouto Bigyan o Paribesh (Class IX \u2014 WBBSE)",
  bn: "\u09AD\u09CC\u09A4\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u092D\u094C\u0924\u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 (\u0915\u0915\u094D\u0937\u093E 9 \u2014 WBBSE)"
};
var TB_PS_10 = {
  en: "Bhouto Bigyan o Paribesh (Class X \u2014 WBBSE Madhyamik)",
  bn: "\u09AD\u09CC\u09A4\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995)",
  hi: "\u092D\u094C\u0924\u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 (\u0915\u0915\u094D\u0937\u093E 10 \u2014 WBBSE \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915)"
};
var TB_LS_9 = {
  en: "Jiban Bigyan o Paribesh (Class IX \u2014 WBBSE)",
  bn: "\u099C\u09C0\u09AC\u09A8 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u091C\u0940\u0935\u0928 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 (\u0915\u0915\u094D\u0937\u093E 9 \u2014 WBBSE)"
};
var TB_LS_10 = {
  en: "Jiban Bigyan o Paribesh (Class X \u2014 WBBSE Madhyamik)",
  bn: "\u099C\u09C0\u09AC\u09A8 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995)",
  hi: "\u091C\u0940\u0935\u0928 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 (\u0915\u0915\u094D\u0937\u093E 10 \u2014 WBBSE \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915)"
};
var CLASS_6_SCIENCE_CHAPTERS = [
  ch("s6_c1", 1, "Ch 1: Environment and Living Organisms (Interdependence)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u099C\u09C0\u09AC\u099C\u0997\u09A4\u09C7\u09B0 \u09AA\u09BE\u09B0\u09B8\u09CD\u09AA\u09B0\u09BF\u0995 \u09A8\u09BF\u09B0\u09CD\u09AD\u09B0\u09A4\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0914\u0930 \u091C\u0940\u0935 \u091C\u0917\u0924 \u0915\u0940 \u092A\u093E\u0930\u0938\u094D\u092A\u0930\u093F\u0915 \u0928\u093F\u0930\u094D\u092D\u0930\u0924\u093E", ["Dependence of plants and animals", "Pollination, seed dispersal, symbiosis, parasitism, food chains"], TB_SCI_6),
  ch("s6_c2", 2, "Ch 2: Events Around Us (Physical & Chemical Changes)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u099A\u09BE\u09B0\u09AA\u09BE\u09B6\u09C7\u09B0 \u0998\u099F\u09A8\u09BE\u09B8\u09AE\u09C2\u09B9", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u0939\u092E\u093E\u0930\u0947 \u091A\u093E\u0930\u094B\u0902 \u0913\u0930 \u0915\u0940 \u0918\u091F\u0928\u093E\u090F\u0901 (\u092D\u094C\u0924\u093F\u0915 \u0914\u0930 \u0930\u093E\u0938\u093E\u092F\u0928\u093F\u0915 \u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928)", ["Unidirectional & bidirectional events", "Periodic & non-periodic events", "Reversible/physical and irreversible/chemical changes"], TB_SCI_6),
  ch("s6_c3", 3, "Ch 3: Element, Compound and Mixture", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AE\u09CC\u09B2\u09BF\u0995, \u09AF\u09CC\u0997\u09BF\u0995 \u0993 \u09AE\u09BF\u09B6\u09CD\u09B0 \u09AA\u09A6\u09BE\u09B0\u09CD\u09A5", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u0924\u0924\u094D\u0935, \u092F\u094C\u0917\u093F\u0915 \u0914\u0930 \u092E\u093F\u0936\u094D\u0930\u0923", ["Metals and non-metals", "Symbols, atomicity, valency, chemical formulae", "Separation of mixtures (filtration, distillation, crystallization)"], TB_SCI_6),
  ch("s6_c4", 4, "Ch 4: Rocks and Minerals", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09B6\u09BF\u09B2\u09BE \u0993 \u0996\u09A8\u09BF\u099C \u09AA\u09A6\u09BE\u09B0\u09CD\u09A5", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u091A\u091F\u094D\u091F\u093E\u0928\u0947\u0902 \u0914\u0930 \u0916\u0928\u093F\u091C \u092A\u0926\u093E\u0930\u094D\u0925", ["Igneous, sedimentary, and metamorphic rocks", "Ores, alloys, fossil fuels (coal, petroleum)"], TB_SCI_6),
  ch("s6_c5", 5, "Ch 5: Measurement or Mensuration of Physical Quantities", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AE\u09BE\u09AA\u099C\u09CB\u0995 \u09AC\u09BE \u09AA\u09B0\u09BF\u09AE\u09BE\u09AA", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u092D\u094C\u0924\u093F\u0915 \u0930\u093E\u0936\u093F\u092F\u094B\u0902 \u0915\u093E \u092E\u093E\u092A\u0928", ["Fundamental and derived units", "SI units of length, mass, time, area, volume", "Measuring cylinder and stopwatch"], TB_SCI_6),
  ch("s6_c6", 6, "Ch 6: Force and Energy (Preliminary Concept)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09AC\u09B2 \u0993 \u09B6\u0995\u09CD\u09A4\u09BF\u09B0 \u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u092C\u0932 \u0914\u0930 \u090A\u0930\u094D\u091C\u093E \u0915\u0940 \u092A\u094D\u0930\u093E\u0930\u0902\u092D\u093F\u0915 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Contact and non-contact forces", "Friction", "Kinetic and potential energy", "Energy transformations"], TB_SCI_6),
  ch("s6_c7", 7, "Ch 7: Liquid and Gaseous States \u2014 Pressure & Thrust", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09A4\u09B0\u09B2 \u0993 \u0997\u09CD\u09AF\u09BE\u09B8\u09C0\u09AF\u09BC \u09AA\u09A6\u09BE\u09B0\u09CD\u09A5\u09C7\u09B0 \u09B8\u09CD\u09A5\u09BF\u09A4\u09BF \u0993 \u0997\u09A4\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u0926\u094D\u0930\u0935 \u0914\u0930 \u0917\u0948\u0938\u0940\u092F \u092A\u0926\u093E\u0930\u094D\u0925\u094B\u0902 \u0915\u0940 \u0938\u094D\u0925\u093F\u0924\u093F \u090F\u0935\u0902 \u0917\u0924\u093F", ["Bernoulli's principle in daily life", "Atmospheric pressure", "Liquid pressure and buoyancy"], TB_SCI_6),
  ch("s6_c8", 8, "Ch 8: Human Body (Heart, Blood, Lungs, Bones & Joints)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09AE\u09BE\u09A8\u09C1\u09B7\u09C7\u09B0 \u09B6\u09B0\u09C0\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u092E\u093E\u0928\u0935 \u0936\u0930\u0940\u0930 (\u0939\u0943\u0926\u092F, \u0930\u0915\u094D\u0924, \u092B\u0947\u092B\u0921\u093C\u0947, \u0905\u0938\u094D\u0925\u093F\u092F\u093E\u0901 \u0914\u0930 \u091C\u094B\u0921\u093C)", ["Chambers of human heart", "Arteries, veins, capillaries, blood components", "Lungs and breathing", "Skeletal joints (ball-and-socket, hinge, pivot)"], TB_SCI_6),
  ch("s6_c9", 9, "Ch 9: Common Machines (Simple Machines)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u09AF\u09A8\u09CD\u09A4\u09CD\u09B0\u09AA\u09BE\u09A4\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u0938\u093E\u0927\u093E\u0930\u0923 \u092E\u0936\u0940\u0928\u0947\u0902 (\u0938\u0930\u0932 \u092F\u0902\u0924\u094D\u0930)", ["Class I, II, III levers", "Inclined plane, wedge, screw, pulley, wheel and axle", "Mechanical advantage"], TB_SCI_6),
  ch("s6_c10", 10, "Ch 10: Biodiversity and Its Classification", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E6: \u099C\u09C0\u09AC\u09AC\u09C8\u099A\u09BF\u09A4\u09CD\u09B0\u09CD\u09AF \u0993 \u09A4\u09BE\u09B0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09C0\u09AC\u09BF\u09AD\u09BE\u0997", "\u0905\u0927\u094D\u092F\u093E\u092F 10: \u091C\u0948\u0935 \u0935\u093F\u0935\u093F\u0927\u0924\u093E \u0914\u0930 \u0909\u0938\u0915\u093E \u0935\u0930\u094D\u0917\u0940\u0915\u0930\u0923", ["Five Kingdom classification (Monera, Protista, Fungi, Plantae, Animalia)", "Algae, bryophytes, pteridophytes, gymnosperms, angiosperms", "Invertebrates and vertebrates"], TB_SCI_6),
  ch("s6_c11", 11, "Ch 11: Habitat and Adaptation of Organisms (Behavioural)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E7: \u0995\u09DF\u09C7\u0995\u099F\u09BF \u09AC\u09BF\u09B6\u09C7\u09B7 \u09AA\u09CD\u09B0\u09BE\u09A3\u09C0\u09B0 \u09AC\u09BE\u09B8\u09B8\u09CD\u09A5\u09BE\u09A8 \u0993 \u0986\u099A\u09B0\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 11: \u0915\u0941\u091B \u0935\u093F\u0936\u0947\u0937 \u092A\u094D\u0930\u093E\u0923\u093F\u092F\u094B\u0902 \u0915\u0947 \u0906\u0935\u093E\u0938 \u0914\u0930 \u0935\u094D\u092F\u0935\u0939\u093E\u0930", ["Social insects: honeybees, ants, termites", "Chimpanzee, migratory birds, behavioral adaptations"], TB_SCI_6),
  ch("s6_c12", 12, "Ch 12: Waste Management and Recycling", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E8: \u09AC\u09B0\u09CD\u099C\u09CD\u09AF \u09AA\u09A6\u09BE\u09B0\u09CD\u09A5", "\u0905\u0927\u094D\u092F\u093E\u092F 12: \u0905\u092A\u0936\u093F\u0937\u094D\u091F \u092A\u0926\u093E\u0930\u094D\u0925 \u0914\u0930 \u092A\u094D\u0930\u092C\u0902\u0927\u0928", ["Biodegradable and non-biodegradable waste", "4R principle: Reduce, Refuse, Reuse, Recycle", "Composting"], TB_SCI_6)
];
var CLASS_7_SCIENCE_CHAPTERS = [
  ch("s7_c1", 1, "Ch 1: Physical Environment \u2014 Heat, Light, Electricity & Magnetism", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AD\u09CC\u09A4 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09A4\u09BE\u09AA, \u0986\u09B2\u09CB, \u099A\u09C1\u09AE\u09CD\u09AC\u0995 \u0993 \u09A4\u09A1\u09BC\u09BF\u09CE)", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092D\u094C\u0924\u093F\u0915 \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 (\u090A\u0937\u094D\u092E\u093E, \u092A\u094D\u0930\u0915\u093E\u0936, \u091A\u0941\u0902\u092C\u0915 \u0914\u0930 \u0935\u093F\u0926\u094D\u092F\u0941\u0924)", ["Thermometry, specific heat, latent heat of fusion (80 cal/g) and vaporization (540 cal/g)", "Rectilinear propagation of light, reflection, refraction, dispersion", "Magnetic induction & electromagnet", "Electric cell, LED, circuit symbols"], TB_SCI_7),
  ch("s7_c2", 2, "Ch 2: Time and Motion", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09B8\u09AE\u09AF\u09BC \u0993 \u0997\u09A4\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u0938\u092E\u092F \u0914\u0930 \u0917\u0924\u093F", ["Rest and motion", "Rectilinear, circular, rotational, periodic motion", "Speed, velocity, acceleration", "Newton's First, Second, and Third Laws of Motion"], TB_SCI_7),
  ch("s7_c3", 3, "Ch 3: Atoms, Molecules and Chemical Reactions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AA\u09B0\u09AE\u09BE\u09A3\u09C1, \u0985\u09A3\u09C1 \u0993 \u09B0\u09BE\u09B8\u09BE\u09AF\u09BC\u09A8\u09BF\u0995 \u09AC\u09BF\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u092A\u0930\u092E\u093E\u0923\u0941, \u0905\u0923\u0941 \u0914\u0930 \u0930\u093E\u0938\u093E\u092F\u0928\u093F\u0915 \u0905\u092D\u093F\u0915\u094D\u0930\u093F\u092F\u093E\u090F\u0901", ["Protons, neutrons, electrons", "Valency, radicals, chemical formulae", "Balancing chemical equations", "Direct combination, decomposition, displacement, double decomposition"], TB_SCI_7),
  ch("s7_c4", 4, "Ch 4: Role of Substances in Environment (Acids, Bases, Salts & Minerals)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6\u09C7\u09B0 \u09B8\u099C\u09C0\u09AC \u0989\u09AA\u09BE\u09A6\u09BE\u09A8\u09C7\u09B0 \u0997\u09A0\u09A8 \u0993 \u09AC\u09BF\u09AD\u09BF\u09A8\u09CD\u09A8 \u09AA\u09A6\u09BE\u09B0\u09CD\u09A5\u09C7\u09B0 \u09AD\u09C2\u09AE\u09BF\u0995\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u092E\u0947\u0902 \u092A\u0926\u093E\u0930\u094D\u0925\u094B\u0902 \u0915\u0940 \u092D\u0942\u092E\u093F\u0915\u093E (\u0905\u092E\u094D\u0932, \u0915\u094D\u0937\u093E\u0930, \u0932\u0935\u0923 \u0914\u0930 \u0916\u0928\u093F\u091C)", ["Indicators (litmus, phenolphthalein, methyl orange)", "pH and neutralization", "Common salt, water, and trace elements in human body", "Polymers and cements"], TB_SCI_7),
  ch("s7_c5", 5, "Ch 5: Human Food (Nutrients, Vitamins, Minerals & Balanced Diet)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AE\u09BE\u09A8\u09C1\u09B7\u09C7\u09B0 \u0996\u09BE\u09A6\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u092E\u093E\u0928\u0935 \u092D\u094B\u091C\u0928 (\u092A\u094B\u0937\u0915 \u0924\u0924\u094D\u0935, \u0935\u093F\u091F\u093E\u092E\u093F\u0928, \u0916\u0928\u093F\u091C \u0914\u0930 \u0938\u0902\u0924\u0941\u0932\u093F\u0924 \u0906\u0939\u093E\u0930)", ["Carbohydrates, proteins, lipids", "Water-soluble (B, C) and fat-soluble (A, D, E, K) vitamins", "Deficiency diseases (Kwashiorkor, Marasmus, Scurvy, Rickets, Goitre, Anaemia)"], TB_SCI_7),
  ch("s7_c6", 6, "Ch 6: Morphological Diversity and Functions of Plant Parts", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6\u09C7\u09B0 \u09B8\u099C\u09C0\u09AC \u0989\u09AA\u09BE\u09A6\u09BE\u09A8\u09C7\u09B0 \u0997\u09A0\u09A8\u0997\u09A4 \u09AC\u09C8\u099A\u09BF\u09A4\u09CD\u09B0\u09CD\u09AF \u0993 \u0995\u09BE\u09B0\u09CD\u09AF\u0997\u09A4 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u092A\u093E\u0926\u092A \u0905\u0902\u0917\u094B\u0902 \u0915\u0940 \u0938\u0902\u0930\u091A\u0928\u093E\u0924\u094D\u092E\u0915 \u0935\u093F\u0935\u093F\u0927\u0924\u093E \u0914\u0930 \u0915\u093E\u0930\u094D\u092F", ["Root zones & modifications", "Stem & leaf modifications", "Complete vs incomplete flowers, pollination, fertilization", "Seeds, fruits, osmosis & diffusion"], TB_SCI_7),
  ch("s7_c7", 7, "Ch 7: Environmental Crisis, Plant & Environment Conservation", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6\u09C7\u09B0 \u09B8\u0982\u0995\u099F, \u0989\u09A6\u09CD\u09AD\u09BF\u09A6 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6\u09C7\u09B0 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923\u0940\u092F \u0938\u0902\u0915\u091F, \u092A\u093E\u0926\u092A \u0914\u0930 \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0938\u0902\u0930\u0915\u094D\u0937\u0923", ["Climate change, global warming", "Loss of biodiversity, mangrove conservation in Sundarbans"], TB_SCI_7),
  ch("s7_c8", 8, "Ch 8: Environment and Public Health", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u099C\u09A8\u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0914\u0930 \u091C\u0928\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F", ["Communicable and water-borne/vector-borne diseases (Malaria, Dengue, Cholera, Plague)", "Occupational hazards, heavy metal pollution (Arsenic, Fluoride)"], TB_SCI_7),
  ch("s7_c9", 9, "Ch 9: Food Production and Improvement", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u0996\u09BE\u09A6\u09CD\u09AF \u0989\u09CE\u09AA\u09BE\u09A6\u09A8 \u0993 \u0986\u09A7\u09C1\u09A8\u09BF\u0995\u09C0\u0995\u09B0\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u0916\u093E\u0926\u094D\u092F \u0909\u0924\u094D\u092A\u093E\u0926\u0928 \u0914\u0930 \u0906\u0927\u0941\u0928\u093F\u0915\u0940\u0915\u0930\u0923", ["Rabi and Kharif crops", "Manures vs chemical fertilizers", "Apiculture, pisciculture, poultry, sericulture"], TB_SCI_7)
];
var CLASS_8_SCIENCE_CHAPTERS = [
  ch("s8_c1", 1, "Ch 1: Physical Environment \u2014 Force, Pressure, Friction, Density & Heat/Light/Static Electricity", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AD\u09CC\u09A4 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09AC\u09B2 \u0993 \u099A\u09BE\u09AA, \u0998\u09B0\u09CD\u09B7\u09A3, \u0998\u09A8\u09A4\u09CD\u09AC \u0993 \u09AA\u09CD\u09B2\u09AC\u09A4\u09BE, \u09A4\u09BE\u09AA, \u0986\u09B2\u09CB \u0993 \u09B8\u09CD\u09A5\u09BF\u09B0 \u09A4\u09A1\u09BC\u09BF\u09CE)", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092D\u094C\u0924\u093F\u0915 \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 (\u092C\u0932, \u0926\u093E\u092C, \u0918\u0930\u094D\u0937\u0923, \u0918\u0928\u0924\u094D\u0935, \u0909\u0924\u094D\u092A\u094D\u0932\u093E\u0935\u0915\u0924\u093E, \u090A\u0937\u094D\u092E\u093E, \u092A\u094D\u0930\u0915\u093E\u0936 \u0914\u0930 \u0938\u094D\u0925\u093F\u0930 \u0935\u093F\u0926\u094D\u092F\u0941\u0924)", ["Newton's law of gravitation F = G m1 m2 / r^2", "Archimedes' principle & buoyancy", "Static electricity & Coulomb interaction", "Conduction, convection, radiation, thermos flask", "Laws of reflection, multiple reflections (kaleidoscope, periscope), total internal reflection & mirage"], TB_SCI_8),
  ch("s8_c2", 2, "Ch 2: Nature of Matter (Physical & Chemical Properties, Atomic Structure & Bonding)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09AE\u09CC\u09B2, \u09AF\u09CC\u0997 \u0993 \u09B0\u09BE\u09B8\u09BE\u09AF\u09BC\u09A8\u09BF\u0995 \u09AC\u09BF\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE (\u09AA\u09A6\u09BE\u09B0\u09CD\u09A5\u09C7\u09B0 \u09AA\u09CD\u09B0\u0995\u09C3\u09A4\u09BF \u0993 \u09AA\u09B0\u09AE\u09BE\u09A3\u09C1\u09B0 \u0997\u09A0\u09A8)", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u092A\u0926\u093E\u0930\u094D\u0925 \u0915\u0940 \u092A\u094D\u0930\u0915\u0943\u0924\u093F, \u092A\u0930\u092E\u093E\u0923\u0941 \u0938\u0902\u0930\u091A\u0928\u093E \u0914\u0930 \u0930\u093E\u0938\u093E\u092F\u0928\u093F\u0915 \u0906\u092C\u0902\u0927\u0928", ["Rutherford and Bohr atomic models", "Atomic number, mass number, isotopes, isobars, isotones", "Ionic and covalent bonding", "Oxidation-reduction, exothermic/endothermic reactions, catalysts, electrolysis"], TB_SCI_8),
  ch("s8_c3", 3, "Ch 3: Several Common Gases (Oxygen, Hydrogen, Carbon Dioxide)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u0995\u09DF\u09C7\u0995\u099F\u09BF \u0997\u09CD\u09AF\u09BE\u09B8\u09C7\u09B0 \u09AA\u09B0\u09BF\u099A\u09BF\u09A4\u09BF (\u0985\u0995\u09CD\u09B8\u09BF\u099C\u09C7\u09A8, \u09B9\u09BE\u0987\u09A1\u09CD\u09B0\u09CB\u099C\u09C7\u09A8, \u0995\u09BE\u09B0\u09CD\u09AC\u09A8 \u09A1\u09BE\u0987\u0985\u0995\u09CD\u09B8\u09BE\u0987\u09A1)", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u0915\u0941\u091B \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0917\u0948\u0938\u094B\u0902 \u0915\u093E \u092A\u0930\u093F\u091A\u092F (\u0911\u0915\u094D\u0938\u0940\u091C\u0928, \u0939\u093E\u0907\u0921\u094D\u0930\u094B\u091C\u0928, \u0915\u093E\u0930\u094D\u092C\u0928 \u0921\u093E\u0907\u0911\u0915\u094D\u0938\u093E\u0907\u0921)", ["Laboratory preparation, physical & chemical properties, and uses of O2, H2, CO2"], TB_SCI_8),
  ch("s8_c4", 4, "Ch 4: Occurrence of Carbon and Its Compounds in Nature", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09AA\u09CD\u09B0\u0995\u09C3\u09A4\u09BF\u09A4\u09C7 \u0995\u09BE\u09B0\u09CD\u09AC\u09A8 \u0993 \u0995\u09BE\u09B0\u09CD\u09AC\u09A8\u0998\u099F\u09BF\u09A4 \u09AF\u09CC\u0997\u09C7\u09B0 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u092A\u094D\u0930\u0915\u0943\u0924\u093F \u092E\u0947\u0902 \u0915\u093E\u0930\u094D\u092C\u0928 \u0914\u0930 \u0909\u0938\u0915\u0947 \u092F\u094C\u0917\u093F\u0915\u094B\u0902 \u0915\u0940 \u0909\u092A\u0938\u094D\u0925\u093F\u0924\u093F", ["Allotropes of carbon: diamond, graphite, fullerene (crystalline) and coal, charcoal, lampblack (amorphous)", "Greenhouse effect, fuel calorific value, polymers"], TB_SCI_8),
  ch("s8_c5", 5, "Ch 5: Natural Phenomena and Their Analysis (Lightning & Epidemic)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AA\u09CD\u09B0\u09BE\u0995\u09C3\u09A4\u09BF\u0995 \u0998\u099F\u09A8\u09BE \u0993 \u09A4\u09BE\u09B0 \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u092A\u094D\u0930\u093E\u0915\u0943\u0924\u093F\u0915 \u0918\u091F\u0928\u093E\u090F\u0901 \u0914\u0930 \u0909\u0928\u0915\u093E \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 (\u0924\u0921\u093C\u093F\u0924 \u0914\u0930 \u092E\u0939\u093E\u092E\u093E\u0930\u0940)", ["Atmospheric electricity, lightning conductor", "Safety during thunderstorms", "Epidemics and pandemics"], TB_SCI_8),
  ch("s8_c6", 6, "Ch 6: Structure of Living Organisms (Cell & Cell Organelles)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09A6\u09C7\u09B9\u09C7\u09B0 \u0997\u09A0\u09A8 (\u0995\u09CB\u09B7, \u0995\u09B2\u09BE \u0993 \u0985\u0999\u09CD\u0997\u09BE\u09A3\u09C1)", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u091C\u0940\u0935\u094B\u0902 \u0915\u0940 \u0938\u0902\u0930\u091A\u0928\u093E (\u0915\u094B\u0936\u093F\u0915\u093E, \u090A\u0924\u0915 \u0914\u0930 \u0915\u094B\u0936\u093F\u0915\u093E\u0902\u0917)", ["Light & electron microscopes", "Prokaryotic vs eukaryotic cells", "Nucleus, mitochondria, plastids, ER, Golgi, ribosomes, lysosomes, centrosome", "Plant and animal tissues"], TB_SCI_8),
  ch("s8_c7", 7, "Ch 7: World of Microbes", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u0985\u09A3\u09C1\u099C\u09C0\u09AC\u09C7\u09B0 \u099C\u0997\u09CE", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u0938\u0942\u0915\u094D\u0937\u094D\u092E\u091C\u0940\u0935\u094B\u0902 \u0915\u093E \u0938\u0902\u0938\u093E\u0930", ["Bacteria, viruses, protozoa, fungi, algae", "Nitrogen fixation (Rhizobium), fermentation, antibiotics, pasteurization"], TB_SCI_8),
  ch("s8_c8", 8, "Ch 8: Human Endocrine System and Adolescence", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09AE\u09BE\u09A8\u09C1\u09B7\u09C7\u09B0 \u0985\u09A8\u09CD\u09A4\u0983\u0995\u09CD\u09B7\u09B0\u09BE \u0997\u09CD\u09B0\u09A8\u09CD\u09A5\u09BF \u0993 \u09AC\u09AF\u09BC\u0983\u09B8\u09A8\u09CD\u09A7\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u092E\u093E\u0928\u0935 \u0905\u0902\u0924\u0903\u0938\u094D\u0930\u093E\u0935\u0940 \u0924\u0902\u0924\u094D\u0930 \u0914\u0930 \u0915\u093F\u0936\u094B\u0930\u093E\u0935\u0938\u094D\u0925\u093E", ["Pituitary, thyroid, adrenal, pancreas (insulin & glucagon), testes, ovaries", "Hormonal regulation and adolescent health"], TB_SCI_8),
  ch("s8_c9", 9, "Ch 9: Food Production and Management (Agriculture & Animal Husbandry)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09A6\u09C7\u09B6\u09C0\u09AF\u09BC \u09AE\u09CE\u09B8\u09CD\u09AF\u099A\u09BE\u09B7 \u0993 \u0995\u09C3\u09B7\u09BF \u0989\u09CE\u09AA\u09BE\u09A6\u09A8 \u09AC\u09CD\u09AF\u09AC\u09B8\u09CD\u09A5\u09BE\u09AA\u09A8\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u0916\u093E\u0926\u094D\u092F \u0909\u0924\u094D\u092A\u093E\u0926\u0928 \u0914\u0930 \u0915\u0943\u0937\u093F \u092A\u094D\u0930\u092C\u0902\u0927\u0928", ["Soil preparation, sowing, irrigation, weeding, harvesting, storage", "High yielding varieties (HYV), organic farming, composite fish culture"], TB_SCI_8),
  ch("s8_c10", 10, "Ch 10: Biodiversity, Environmental Crisis and Conservation of Endangered Animals", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E6: \u099C\u09C0\u09AC\u09AC\u09C8\u099A\u09BF\u09A4\u09CD\u09B0\u09CD\u09AF, \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6\u09C7\u09B0 \u09B8\u0982\u0995\u099F \u0993 \u09AC\u09BF\u09AA\u09A8\u09CD\u09A8 \u09AA\u09CD\u09B0\u09BE\u09A3\u09C0 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 10: \u091C\u0948\u0935 \u0935\u093F\u0935\u093F\u0927\u0924\u093E, \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923\u0940\u092F \u0938\u0902\u0915\u091F \u0914\u0930 \u0938\u0902\u0915\u091F\u0917\u094D\u0930\u0938\u094D\u0924 \u092A\u094D\u0930\u093E\u0923\u093F\u092F\u094B\u0902 \u0915\u093E \u0938\u0902\u0930\u0915\u094D\u0937\u0923", ["Forest ecosystems, desert & polar adaptations", "IUCN Red Data Book, Royal Bengal Tiger, One-horned Rhino, Red Panda, Gangetic Dolphin"], TB_SCI_8),
  ch("s8_c11", 11, "Ch 11: Our Surrounding Environment and Plant World (Spices & Medicinal Plants)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E7: \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u099A\u09BE\u09B0\u09AA\u09BE\u09B6\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u0989\u09A6\u09CD\u09AD\u09BF\u09A6\u099C\u0997\u09CE", "\u0905\u0927\u094D\u092F\u093E\u092F 11: \u0939\u092E\u093E\u0930\u0947 \u091A\u093E\u0930\u094B\u0902 \u0913\u0930 \u0915\u093E \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0914\u0930 \u092A\u093E\u0926\u092A \u091C\u0917\u0924 (\u0914\u0937\u0927\u0940\u092F \u092A\u094C\u0927\u0947 \u090F\u0935\u0902 \u092E\u0938\u093E\u0932\u0947)", ["Medicinal compounds in Neem, Tulsi, Cinchona (quinine), Turmeric, Garlic, Aloe vera", "Spices: black pepper, cinnamon, clove, cardamom, saffron"], TB_SCI_8)
];
var EVS_SUBJECT = {
  id: "evs",
  name: {
    en: "Environmental Studies (Amader Paribesh)",
    bn: "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (Environmental Studies)",
    hi: "\u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0930\u093F\u0935\u0947\u0936 (Environmental Studies)"
  },
  shortDesc: {
    en: "Official WBBPE Class V Amader Paribesh textbook covering human body, soil, water, biodiversity, West Bengal geography, heritage & sky.",
    bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6\u09C7\u09B0 \u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09B0 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u09AE\u09BE\u09A8\u09AC\u09A6\u09C7\u09B9, \u09AD\u09CC\u09A4 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6, \u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997\u09C7\u09B0 \u09AA\u09CD\u09B0\u0995\u09C3\u09A4\u09BF, \u0990\u09A4\u09BF\u09B9\u09CD\u09AF \u0993 \u0986\u0995\u09BE\u09B6\u0964",
    hi: "WBBPE \u0915\u0915\u094D\u0937\u093E 5 \u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0930\u093F\u0935\u0947\u0936 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u2014 \u092E\u093E\u0928\u0935 \u0936\u0930\u0940\u0930, \u092E\u0943\u0926\u093E, \u091C\u0932, \u091C\u0948\u0935 \u0935\u093F\u0935\u093F\u0927\u0924\u093E, \u092A\u0936\u094D\u091A\u093F\u092E \u092C\u0902\u0917\u093E\u0932 \u0915\u093E \u092D\u0942\u0917\u094B\u0932, \u0935\u093F\u0930\u093E\u0938\u0924 \u0914\u0930 \u0906\u0915\u093E\u0936\u0964"
  },
  domainGuardKeywords: [
    "body",
    "skin",
    "bone",
    "soil",
    "water",
    "forest",
    "west bengal",
    "river",
    "agriculture",
    "transport",
    "solar",
    "eclipse"
  ],
  curriculumByClass: {
    5: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_EVS_5,
      syllabusVersion: "WBBPE Primary Syllabus (Current Edition)",
      officialSource: "West Bengal Board of Primary Education \u2014 Amader Paribesh Class V",
      boardNote: {
        en: "Official WBBPE Class V Amader Paribesh \u2014 All 10 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBPE) \u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E6\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBPE \u0915\u0915\u094D\u0937\u093E 5 \u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0930\u093F\u0935\u0947\u0936 \u2014 \u0938\u092D\u0940 10 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("evs5_c1", 1, "Ch 1: Human Body (Skin, Melanin, Hair, Bones, Joints, Muscles, Heart & Blood)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AE\u09BE\u09A8\u09AC\u09A6\u09C7\u09B9 (\u09A4\u09CD\u09AC\u0995, \u09AE\u09C7\u09B2\u09BE\u09A8\u09BF\u09A8, \u0985\u09B8\u09CD\u09A5\u09BF, \u09B8\u09A8\u09CD\u09A7\u09BF, \u09AA\u09C7\u09B6\u09BF, \u09B9\u09C3\u09CE\u09AA\u09BF\u09A3\u09CD\u09A1 \u0993 \u09B0\u0995\u09CD\u09A4)", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092E\u093E\u0928\u0935 \u0936\u0930\u0940\u0930 (\u0924\u094D\u0935\u091A\u093E, \u092E\u0947\u0932\u093E\u0928\u093F\u0928, \u0905\u0938\u094D\u0925\u093F\u092F\u093E\u0901, \u091C\u094B\u0921\u093C, \u092E\u093E\u0902\u0938\u092A\u0947\u0936\u093F\u092F\u093E\u0901, \u0939\u0943\u0926\u092F \u0914\u0930 \u0930\u0915\u094D\u0924)", ["Layers of skin & melanin pigment", "Major bones (femur to stapes) and joints", "Stethoscope invention (Laennec)", "ORS preparation and immunity"], TB_EVS_5),
        ch("evs5_c2", 2, "Ch 2: Physical Environment \u2014 Soil, Water & Biodiversity", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09AD\u09CC\u09A4 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u2014 \u09AE\u09BE\u099F\u09BF, \u099C\u09B2 \u0993 \u099C\u09C0\u09AC\u09AC\u09C8\u099A\u09BF\u09A4\u09CD\u09B0\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u092D\u094C\u0924\u093F\u0915 \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u2014 \u092E\u093F\u091F\u094D\u091F\u0940, \u091C\u0932 \u0914\u0930 \u091C\u0948\u0935 \u0935\u093F\u0935\u093F\u0927\u0924\u093E", ["Sandy, clayey, and loamy soil", "Soil erosion and earthworm as farmer friend", "Surface water, groundwater, pond ecosystem, East Kolkata Wetlands"], TB_EVS_5),
        ch("evs5_c3", 3, "Ch 3: General Introduction to West Bengal (Physiography & Rivers)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997\u09C7\u09B0 \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u09AA\u09B0\u09BF\u099A\u09BF\u09A4\u09BF (\u09AD\u09C2\u09AA\u09CD\u09B0\u0995\u09C3\u09A4\u09BF \u0993 \u09A8\u09A6\u09A8\u09A6\u09C0)", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u092A\u0936\u094D\u091A\u093F\u092E \u092C\u0902\u0917\u093E\u0932 \u0915\u093E \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u092A\u0930\u093F\u091A\u092F (\u092D\u0942-\u0906\u0915\u0943\u0924\u093F \u0914\u0930 \u0928\u0926\u093F\u092F\u093E\u0901)", ["Darjeeling Himalayas (Sandakphu)", "Western Rarh plateau (Mama-Bhagne hill)", "Ganges delta, Sundarbans, Teesta, Torsha, Damodar, Rupnarayan, Hooghly"], TB_EVS_5),
        ch("evs5_c4", 4, "Ch 4: Environment and Wealth (Forests, Wildlife & Human Livelihood)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09B8\u09AE\u09CD\u09AA\u09A6 (\u09AC\u09A8\u09AD\u09C2\u09AE\u09BF, \u09AC\u09A8\u09CD\u09AF\u09AA\u09CD\u09B0\u09BE\u09A3\u09C0 \u0993 \u099C\u09C0\u09AC\u09BF\u0995\u09BE)", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0914\u0930 \u0938\u0902\u092A\u0926\u093E (\u0935\u0928, \u0935\u0928\u094D\u092F\u091C\u0940\u0935 \u0914\u0930 \u0906\u091C\u0940\u0935\u093F\u0915\u093E)", ["Sal, teak, sundari trees", "One-horned rhino (Jaldapara/Gorumara), Royal Bengal Tiger", "Joint Forest Management (Arabari)"], TB_EVS_5),
        ch("evs5_c5", 5, "Ch 5: Agriculture and Fisheries of West Bengal", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997\u09C7\u09B0 \u0995\u09C3\u09B7\u09BF \u0993 \u09AE\u09CE\u09B8\u09CD\u09AF\u099A\u09BE\u09B7", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u092A\u0936\u094D\u091A\u093F\u092E \u092C\u0902\u0917\u093E\u0932 \u0915\u0940 \u0915\u0943\u0937\u093F \u0914\u0930 \u092E\u0924\u094D\u0938\u094D\u092F \u092A\u093E\u0932\u0928", ["Aus, Aman, Boro paddy", "Jute, tea (Darjeeling/Dooars), mango (Malda), potato", "Major Carp (Rohu, Catla, Mrigal) and Hilsa conservation"], TB_EVS_5),
        ch("evs5_c6", 6, "Ch 6: Mineral Resources & Energy Sources (Coal, Thermal & Solar Power)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u0996\u09A8\u09BF\u099C \u09B8\u09AE\u09CD\u09AA\u09A6 \u098F\u09AC\u0982 \u09B6\u0995\u09CD\u09A4\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u0916\u0928\u093F\u091C \u0938\u0902\u0938\u093E\u0927\u0928 \u0914\u0930 \u090A\u0930\u094D\u091C\u093E \u0915\u0947 \u0938\u094D\u0930\u094B\u0924 (\u0915\u094B\u092F\u0932\u093E, \u0924\u093E\u092A \u0935\u093F\u0926\u094D\u092F\u0941\u0924 \u0914\u0930 \u0938\u094C\u0930 \u090A\u0930\u094D\u091C\u093E)", ["Raniganj coalfield", "Thermal power plants (Kolaghat, Bakreswar, Farakka)", "Conventional vs non-conventional energy (solar, wind, bio-gas)"], TB_EVS_5),
        ch("evs5_c7", 7, "Ch 7: Transport, Vehicles and Road Safety Rules", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09AA\u09B0\u09BF\u09AC\u09B9\u09A8 \u0993 \u09AF\u09BE\u09A8\u09AC\u09BE\u09B9\u09A8 \u098F\u09AC\u0982 \u09AA\u09A5 \u09A8\u09BF\u09B0\u09BE\u09AA\u09A4\u09CD\u09A4\u09BE\u09B0 \u09A8\u09BF\u09AF\u09BC\u09AE", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u092A\u0930\u093F\u0935\u0939\u0928, \u0935\u093E\u0939\u0928 \u0914\u0930 \u0938\u0921\u093C\u0915 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0928\u093F\u092F\u092E", ["Evolution of wheel and boats", "First train in Bengal (Howrah to Hooghly, 1854)", "Tramway and Metro in Kolkata", "Traffic signals and zebra crossing"], TB_EVS_5),
        ch("evs5_c8", 8, "Ch 8: Environment and Production \u2014 Cottage & Heavy Industries, Folk Culture", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u0989\u09CE\u09AA\u09BE\u09A6\u09A8 \u2014 \u0995\u09C1\u099F\u09BF\u09B0 \u09B6\u09BF\u09B2\u09CD\u09AA, \u09AC\u09C3\u09B9\u09CE \u09B6\u09BF\u09B2\u09CD\u09AA \u0993 \u09B2\u09CB\u0995\u09B8\u0982\u09B8\u09CD\u0995\u09C3\u09A4\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0914\u0930 \u0909\u0924\u094D\u092A\u093E\u0926\u0928 \u2014 \u0915\u0941\u091F\u0940\u0930 \u090F\u0935\u0902 \u092D\u093E\u0930\u0940 \u0909\u0926\u094D\u092F\u094B\u0917 \u0914\u0930 \u0932\u094B\u0915 \u0938\u0902\u0938\u094D\u0915\u0943\u0924\u093F", ["Tant/Baluchari sarees, Krishnanagar clay dolls, Bankura terracotta, Purulia Chhau mask", "Durgapur, Asansol, Haldia industrial belts"], TB_EVS_5),
        ch("evs5_c9", 9, "Ch 9: Human Rights, Social Reformers & Freedom Struggle Heritage", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u09AE\u09BE\u09A8\u09AC\u09BE\u09A7\u09BF\u0995\u09BE\u09B0, \u09B8\u09AE\u09BE\u099C \u09B8\u0982\u09B8\u09CD\u0995\u09BE\u09B0\u0995 \u0993 \u09B8\u09CD\u09AC\u09BE\u09A7\u09C0\u09A8\u09A4\u09BE \u09B8\u0982\u0997\u09CD\u09B0\u09BE\u09AE\u09C7\u09B0 \u0990\u09A4\u09BF\u09B9\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u092E\u093E\u0928\u0935\u093E\u0927\u093F\u0915\u093E\u0930, \u0938\u092E\u093E\u091C \u0938\u0941\u0927\u093E\u0930\u0915 \u0914\u0930 \u0938\u094D\u0935\u0924\u0902\u0924\u094D\u0930\u0924\u093E \u0938\u0902\u0917\u094D\u0930\u093E\u092E \u0915\u0940 \u0935\u093F\u0930\u093E\u0938\u0924", ["Raja Rammohan Roy, Ishwar Chandra Vidyasagar, Rabindranath Tagore, Begum Rokeya", "Netaji Subhas Chandra Bose, Khudiram Bose, Matangini Hazra, Sidhu-Kanhu, Birsa Munda"], TB_EVS_5),
        ch("evs5_c10", 10, "Ch 10: Sky, Solar System, Eclipses & Disaster Management", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E6: \u0986\u0995\u09BE\u09B6, \u09B8\u09CC\u09B0\u099C\u0997\u09CE, \u0997\u09CD\u09B0\u09B9\u09A3 \u0993 \u09AA\u09CD\u09B0\u09BE\u0995\u09C3\u09A4\u09BF\u0995 \u09AC\u09BF\u09AA\u09B0\u09CD\u09AF\u09AF\u09BC \u09AE\u09CB\u0995\u09BE\u09AC\u09BF\u09B2\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 10: \u0906\u0915\u093E\u0936, \u0938\u094C\u0930\u092E\u0902\u0921\u0932, \u0917\u094D\u0930\u0939\u0923 \u0914\u0930 \u0906\u092A\u0926\u093E \u092A\u094D\u0930\u092C\u0902\u0927\u0928", ["Phases of the Moon (Full Moon & New Moon)", "Solar and Lunar eclipses", "Tides, cyclones (Aila/Amphan), earthquakes, and first aid"], TB_EVS_5)
      ]
    },
    6: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_SCI_6,
      syllabusVersion: "WBBSE Upper Primary (Transitions to Paribesh o Bigyan)",
      officialSource: "WBBSE Class VI Paribesh o Bigyan",
      boardNote: {
        en: "In Class 6, Environmental Studies transitions into Paribesh o Bigyan, History, and Geography.",
        bn: "\u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AC\u09BF\u09AD\u0995\u09CD\u09A4 \u09B9\u09AF\u09BC\u09C7 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8, \u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u098F\u09AC\u0982 \u09AD\u09C2\u0997\u09CB\u09B2 \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u09AA\u09BE\u09A0\u09CD\u09AF\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 6 \u092E\u0947\u0902 \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0905\u0927\u094D\u092F\u092F\u0928 \u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928, \u0907\u0924\u093F\u0939\u093E\u0938 \u0914\u0930 \u092D\u0942\u0917\u094B\u0932 \u092E\u0947\u0902 \u0935\u093F\u092D\u093E\u091C\u093F\u0924 \u0939\u094B \u091C\u093E\u0924\u093E \u0939\u0948\u0964"
      },
      chapters: CLASS_6_SCIENCE_CHAPTERS
    },
    7: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_SCI_7,
      syllabusVersion: "WBBSE Upper Primary",
      officialSource: "WBBSE Class VII Paribesh o Bigyan",
      boardNote: {
        en: "In Class 7, Environmental Science is taught under Paribesh o Bigyan.",
        bn: "\u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09AD\u09C1\u0995\u09CD\u09A4\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 7 \u092E\u0947\u0902 \u092F\u0939 \u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0915\u0947 \u0905\u0902\u0924\u0930\u094D\u0917\u0924 \u092A\u0922\u093C\u093E\u092F\u093E \u091C\u093E\u0924\u093E \u0939\u0948\u0964"
      },
      chapters: CLASS_7_SCIENCE_CHAPTERS
    },
    8: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_SCI_8,
      syllabusVersion: "WBBSE Upper Primary",
      officialSource: "WBBSE Class VIII Paribesh o Bigyan",
      boardNote: {
        en: "In Class 8, Environmental Science is taught under Paribesh o Bigyan.",
        bn: "\u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09AD\u09C1\u0995\u09CD\u09A4\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 8 \u092E\u0947\u0902 \u092F\u0939 \u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0915\u0947 \u0905\u0902\u0924\u0930\u094D\u0917\u0924 \u092A\u0922\u093C\u093E\u092F\u093E \u091C\u093E\u0924\u093E \u0939\u0948\u0964"
      },
      chapters: CLASS_8_SCIENCE_CHAPTERS
    },
    9: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_LS_9,
      syllabusVersion: "WBBSE Secondary",
      officialSource: "WBBSE Class IX Jiban Bigyan o Paribesh",
      boardNote: {
        en: "In Class 9, Ecology & Environment are integrated in Jiban Bigyan o Paribesh and Bhouto Bigyan o Paribesh.",
        bn: "\u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u099C\u09C0\u09AC\u09A8 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u098F\u09AC\u0982 \u09AD\u09CC\u09A4\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6\u09C7\u09B0 \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09AD\u09C1\u0995\u09CD\u09A4\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 9 \u092E\u0947\u0902 \u092F\u0939 \u091C\u0940\u0935\u0928 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 \u0924\u0925\u093E \u092D\u094C\u0924\u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 \u092E\u0947\u0902 \u0938\u092E\u093E\u0939\u093F\u0924 \u0939\u0948\u0964"
      },
      chapters: [
        ch("evs9_c1", 1, "Ch 5: Environment and Its Resources (Ecology & Conservation)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09A4\u09BE\u09B0 \u09B8\u09AE\u09CD\u09AA\u09A6", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0914\u0930 \u0909\u0938\u0915\u0947 \u0938\u0902\u0938\u093E\u0927\u0928", ["Ecological organization, food web, energy flow (10% law), biogeochemical cycles, biodiversity conservation"], TB_LS_9)
      ]
    },
    10: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_LS_10,
      syllabusVersion: "WBBSE Madhyamik",
      officialSource: "WBBSE Class X Jiban Bigyan o Paribesh & Bhouto Bigyan o Paribesh",
      boardNote: {
        en: "In Class 10, Environment is integrated into Ch 5 of Life Science and Ch 1 of Physical Science.",
        bn: "\u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u099C\u09C0\u09AC\u09A8 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 (\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB) \u0993 \u09AD\u09CC\u09A4\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 (\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7)-\u098F\u09B0 \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09AD\u09C1\u0995\u09CD\u09A4\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 10 \u092E\u0947\u0902 \u092F\u0939 \u091C\u0940\u0935\u0928 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 (\u0905\u0927\u094D\u092F\u093E\u092F 5) \u0914\u0930 \u092D\u094C\u0924\u0935\u093F\u091C\u094D\u091E\u093E\u0928 (\u0905\u0927\u094D\u092F\u093E\u092F 1) \u092E\u0947\u0902 \u0938\u092E\u093E\u0939\u093F\u0924 \u0939\u0948\u0964"
      },
      chapters: [
        ch("evs10_c1", 1, "Ch 5: Environment, Its Resources and Their Conservation", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6, \u09A4\u09BE\u09B0 \u09B8\u09AE\u09CD\u09AA\u09A6 \u098F\u09AC\u0982 \u09A4\u09BE\u09A6\u09C7\u09B0 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923, \u0909\u0938\u0915\u0947 \u0938\u0902\u0938\u093E\u0927\u0928 \u0914\u0930 \u0909\u0928\u0915\u093E \u0938\u0902\u0930\u0915\u094D\u0937\u0923", ["Nitrogen cycle, air/water/soil/noise pollution, eutrophication, biodiversity hotspots, in-situ & ex-situ conservation"], TB_LS_10)
      ]
    }
  }
};
var SCIENCE_SUBJECT = {
  id: "science",
  name: {
    en: "Environment & Science (Paribesh o Bigyan)",
    bn: "\u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 (Environment & Science)",
    hi: "\u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 (Environment & Science)"
  },
  shortDesc: {
    en: "Official WBBSE Upper Primary Paribesh o Bigyan textbook covering physical, chemical, biological, and environmental sciences.",
    bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6\u09C7\u09B0 \u09B7\u09B7\u09CD\u09A0, \u09B8\u09AA\u09CD\u09A4\u09AE \u0993 \u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u09B8\u09AE\u09C2\u09B9\u0964",
    hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 6, 7 \u0914\u0930 8 \u0915\u0940 \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u0915\u0947 \u0938\u092D\u0940 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
  },
  domainGuardKeywords: [
    "science",
    "force",
    "heat",
    "light",
    "atom",
    "molecule",
    "reaction",
    "cell",
    "plant",
    "animal",
    "human",
    "biodiversity"
  ],
  curriculumByClass: {
    5: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_EVS_5,
      syllabusVersion: "WBBPE Primary Syllabus",
      officialSource: "WBBPE \u2014 Amader Paribesh Class V (Science Units)",
      boardNote: {
        en: "In Class 5, Science is taught through the official Amader Paribesh textbook.",
        bn: "\u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09AD\u09C1\u0995\u09CD\u09A4\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 5 \u092E\u0947\u0902 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0930\u093F\u0935\u0947\u0936 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u0915\u0947 \u0905\u0902\u0924\u0930\u094D\u0917\u0924 \u092A\u0922\u093C\u093E\u092F\u093E \u091C\u093E\u0924\u093E \u0939\u0948\u0964"
      },
      chapters: [
        EVS_SUBJECT.curriculumByClass[5].chapters[0],
        EVS_SUBJECT.curriculumByClass[5].chapters[1],
        EVS_SUBJECT.curriculumByClass[5].chapters[3],
        EVS_SUBJECT.curriculumByClass[5].chapters[5],
        EVS_SUBJECT.curriculumByClass[5].chapters[9]
      ]
    },
    6: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_SCI_6,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Paribesh o Bigyan Class VI (Chapters 1\u201312)",
      boardNote: {
        en: "Official WBBSE Class VI Paribesh o Bigyan \u2014 All 12 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E8\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 6 \u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u2014 \u0938\u092D\u0940 12 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: CLASS_6_SCIENCE_CHAPTERS
    },
    7: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_SCI_7,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Paribesh o Bigyan Class VII (Chapters 1\u20139)",
      boardNote: {
        en: "Official WBBSE Class VII Paribesh o Bigyan \u2014 All 9 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09EF\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 7 \u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u2014 \u0938\u092D\u0940 9 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: CLASS_7_SCIENCE_CHAPTERS
    },
    8: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_SCI_8,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Paribesh o Bigyan Class VIII (Chapters 1\u201311)",
      boardNote: {
        en: "Official WBBSE Class VIII Paribesh o Bigyan \u2014 All 11 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E7\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 8 \u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u2014 \u0938\u092D\u0940 11 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: CLASS_8_SCIENCE_CHAPTERS
    },
    9: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_PS_9,
      syllabusVersion: "WBBSE Secondary Syllabus",
      officialSource: "WBBSE Class IX Physical Science & Life Science",
      boardNote: {
        en: "In Class 9, Science splits into two official textbooks: Physical Science and Life Science.",
        bn: "\u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09A6\u09C1\u099F\u09BF \u09B8\u09CD\u09AC\u09A4\u09A8\u09CD\u09A4\u09CD\u09B0 \u09AC\u09BF\u09B7\u09AF\u09BC\u09C7 \u09AC\u09BF\u09AD\u0995\u09CD\u09A4: \u09AD\u09CC\u09A4\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u099C\u09C0\u09AC\u09A8 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 9 \u092E\u0947\u0902 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0926\u094B \u0905\u0932\u0917 \u0935\u093F\u0937\u092F\u094B\u0902 \u092E\u0947\u0902 \u0935\u093F\u092D\u093E\u091C\u093F\u0924 \u0939\u0948: \u092D\u094C\u0924\u093F\u0915 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0914\u0930 \u091C\u0940\u0935\u0928 \u0935\u093F\u091C\u094D\u091E\u093E\u0928\u0964"
      },
      chapters: []
    },
    10: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_PS_10,
      syllabusVersion: "WBBSE Madhyamik Syllabus",
      officialSource: "WBBSE Class X Physical Science & Life Science",
      boardNote: {
        en: "In Class 10, Science splits into two official textbooks: Physical Science and Life Science.",
        bn: "\u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09A6\u09C1\u099F\u09BF \u09B8\u09CD\u09AC\u09A4\u09A8\u09CD\u09A4\u09CD\u09B0 \u09AC\u09BF\u09B7\u09AF\u09BC\u09C7 \u09AC\u09BF\u09AD\u0995\u09CD\u09A4: \u09AD\u09CC\u09A4\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u099C\u09C0\u09AC\u09A8 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 10 \u092E\u0947\u0902 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0926\u094B \u0905\u0932\u0917 \u0935\u093F\u0937\u092F\u094B\u0902 \u092E\u0947\u0902 \u0935\u093F\u092D\u093E\u091C\u093F\u0924 \u0939\u0948: \u092D\u094C\u0924\u093F\u0915 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0914\u0930 \u091C\u0940\u0935\u0928 \u0935\u093F\u091C\u094D\u091E\u093E\u0928\u0964"
      },
      chapters: []
    }
  }
};
var PHYSICAL_SCIENCE_SUBJECT = {
  id: "physical_science",
  name: {
    en: "Physical Science",
    bn: "\u09AD\u09CC\u09A4\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 (Physical Science)",
    hi: "\u092D\u094C\u0924\u093F\u0915 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 (Physical Science)"
  },
  shortDesc: {
    en: "Physics, chemistry, atomic structure, gas laws, light, electricity, metallurgy & organic chemistry from WBBSE Bhouto Bigyan o Paribesh.",
    bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6\u09C7\u09B0 \u09AD\u09CC\u09A4\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u09AA\u09A6\u09BE\u09B0\u09CD\u09A5\u09AC\u09BF\u09A6\u09CD\u09AF\u09BE \u0993 \u09B0\u09B8\u09BE\u09AF\u09BC\u09A8\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u09B8\u09AE\u09C2\u09B9\u0964",
    hi: "WBBSE \u092D\u094C\u0924\u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u0938\u0947 \u092D\u094C\u0924\u093F\u0915\u0940 \u0914\u0930 \u0930\u0938\u093E\u092F\u0928 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0915\u0947 \u0938\u092D\u0940 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
  },
  domainGuardKeywords: [
    "force",
    "motion",
    "pressure",
    "heat",
    "light",
    "lens",
    "prism",
    "current",
    "ohm",
    "atom",
    "mole",
    "acid",
    "gas",
    "periodic",
    "electrolysis",
    "metallurgy",
    "organic"
  ],
  curriculumByClass: {
    5: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_EVS_5,
      syllabusVersion: "WBBPE Primary Syllabus",
      officialSource: "WBBPE \u2014 Amader Paribesh Class V",
      boardNote: {
        en: "Integrated in Class 5 Amader Paribesh (Physical Environment, Minerals, Energy & Sky).",
        bn: "\u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u09AD\u09CC\u09A4 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09B6\u0995\u09CD\u09A4\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u09C7\u09B0 \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09AD\u09C1\u0995\u09CD\u09A4\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 5 \u092E\u0947\u0902 \u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0930\u093F\u0935\u0947\u0936 (\u092D\u094C\u0924\u093F\u0915 \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0914\u0930 \u090A\u0930\u094D\u091C\u093E) \u0915\u0947 \u0905\u0902\u0924\u0930\u094D\u0917\u0924 \u0938\u092E\u093E\u0939\u093F\u0924\u0964"
      },
      chapters: [
        EVS_SUBJECT.curriculumByClass[5].chapters[1],
        EVS_SUBJECT.curriculumByClass[5].chapters[5],
        EVS_SUBJECT.curriculumByClass[5].chapters[6],
        EVS_SUBJECT.curriculumByClass[5].chapters[9]
      ]
    },
    6: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_SCI_6,
      syllabusVersion: "WBBSE Upper Primary Syllabus",
      officialSource: "WBBSE \u2014 Paribesh o Bigyan Class VI (Physical & Chemical Chapters)",
      boardNote: {
        en: "In Class 6, Physical & Chemical Science is part of the prescribed Paribesh o Bigyan textbook.",
        bn: "\u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u09AD\u09CC\u09A4 \u0993 \u09B0\u09BE\u09B8\u09BE\u09AF\u09BC\u09A8\u09BF\u0995 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u0985\u0982\u09B6\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 6 \u092E\u0947\u0902 \u092D\u094C\u0924\u093F\u0915 \u0935 \u0930\u093E\u0938\u093E\u092F\u0928\u093F\u0915 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u0915\u093E \u0939\u093F\u0938\u094D\u0938\u093E \u0939\u0948\u0964"
      },
      chapters: [
        CLASS_6_SCIENCE_CHAPTERS[1],
        CLASS_6_SCIENCE_CHAPTERS[2],
        CLASS_6_SCIENCE_CHAPTERS[3],
        CLASS_6_SCIENCE_CHAPTERS[4],
        CLASS_6_SCIENCE_CHAPTERS[5],
        CLASS_6_SCIENCE_CHAPTERS[6],
        CLASS_6_SCIENCE_CHAPTERS[8]
      ]
    },
    7: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_SCI_7,
      syllabusVersion: "WBBSE Upper Primary Syllabus",
      officialSource: "WBBSE \u2014 Paribesh o Bigyan Class VII (Physical & Chemical Chapters)",
      boardNote: {
        en: "In Class 7, Physical & Chemical Science is part of the prescribed Paribesh o Bigyan textbook.",
        bn: "\u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u09AD\u09CC\u09A4 \u0993 \u09B0\u09BE\u09B8\u09BE\u09AF\u09BC\u09A8\u09BF\u0995 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u0985\u0982\u09B6\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 7 \u092E\u0947\u0902 \u092D\u094C\u0924\u093F\u0915 \u0935 \u0930\u093E\u0938\u093E\u092F\u0928\u093F\u0915 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u0915\u093E \u0939\u093F\u0938\u094D\u0938\u093E \u0939\u0948\u0964"
      },
      chapters: [
        CLASS_7_SCIENCE_CHAPTERS[0],
        CLASS_7_SCIENCE_CHAPTERS[1],
        CLASS_7_SCIENCE_CHAPTERS[2],
        CLASS_7_SCIENCE_CHAPTERS[3]
      ]
    },
    8: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_SCI_8,
      syllabusVersion: "WBBSE Upper Primary Syllabus",
      officialSource: "WBBSE \u2014 Paribesh o Bigyan Class VIII (Physical & Chemical Chapters)",
      boardNote: {
        en: "In Class 8, Physical & Chemical Science is part of the prescribed Paribesh o Bigyan textbook.",
        bn: "\u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u09AD\u09CC\u09A4 \u0993 \u09B0\u09BE\u09B8\u09BE\u09AF\u09BC\u09A8\u09BF\u0995 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u0985\u0982\u09B6\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 8 \u092E\u0947\u0902 \u092D\u094C\u0924\u093F\u0915 \u0935 \u0930\u093E\u0938\u093E\u092F\u0928\u093F\u0915 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u0915\u093E \u0939\u093F\u0938\u094D\u0938\u093E \u0939\u0948\u0964"
      },
      chapters: [
        CLASS_8_SCIENCE_CHAPTERS[0],
        CLASS_8_SCIENCE_CHAPTERS[1],
        CLASS_8_SCIENCE_CHAPTERS[2],
        CLASS_8_SCIENCE_CHAPTERS[3],
        CLASS_8_SCIENCE_CHAPTERS[4]
      ]
    },
    9: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_PS_9,
      syllabusVersion: "WBBSE Secondary Curriculum (Current Edition)",
      officialSource: "WBBSE \u2014 Bhouto Bigyan o Paribesh Class IX (Chapters 1\u20137)",
      boardNote: {
        en: "Official WBBSE Class IX Bhouto Bigyan o Paribesh \u2014 All 7 Verified Chapters (with Sub-units).",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u09AD\u09CC\u09A4\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09ED\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 9 \u092D\u094C\u0924\u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 \u2014 \u0938\u092D\u0940 7 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("ps9_c1", 1, "Ch 1: Measurement (Physical Quantities, Units, Dimensions & Measuring Instruments)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AA\u09B0\u09BF\u09AE\u09BE\u09AA (\u09AD\u09CC\u09A4 \u09B0\u09BE\u09B6\u09BF, \u098F\u0995\u0995, \u09AE\u09BE\u09A4\u09CD\u09B0\u09BE \u0993 \u09AA\u09B0\u09BF\u09AE\u09BE\u09AA\u0995 \u09AF\u09A8\u09CD\u09A4\u09CD\u09B0)", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092E\u093E\u092A\u0928 (\u092D\u094C\u0924\u093F\u0915 \u0930\u093E\u0936\u093F\u092F\u093E\u0901, \u092E\u093E\u0924\u094D\u0930\u0915, \u0935\u093F\u092E\u093E\u090F\u0901 \u0914\u0930 \u092E\u093E\u092A\u0915 \u092F\u0902\u0924\u094D\u0930)", ["Fundamental & derived units", "Dimensional formulae [M L T]", "Ordinary balance, measuring cylinder, stopwatch"], TB_PS_9),
        ch("ps9_c2", 2, "Ch 2: Force and Motion (Kinematics, Newton Laws & Conservation of Momentum)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09AC\u09B2 \u0993 \u0997\u09A4\u09BF (\u09A8\u09BF\u0989\u099F\u09A8\u09C7\u09B0 \u0997\u09A4\u09BF\u09B8\u09C2\u09A4\u09CD\u09B0 \u0993 \u09B0\u09C8\u0996\u09BF\u0995 \u09AD\u09B0\u09AC\u09C7\u0997\u09C7\u09B0 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3)", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u092C\u0932 \u0914\u0930 \u0917\u0924\u093F (\u0928\u094D\u092F\u0942\u091F\u0928 \u0915\u0947 \u0917\u0924\u093F \u0928\u093F\u092F\u092E \u0914\u0930 \u0930\u0947\u0916\u0940\u092F \u0938\u0902\u0935\u0947\u0917 \u0938\u0902\u0930\u0915\u094D\u0937\u0923)", ["Displacement, velocity, acceleration", "Equations of motion v = u + at, s = ut + \xBDat^2, v^2 = u^2 + 2as", "Newton's 3 laws, impulse, recoil of gun"], TB_PS_9),
        ch("ps9_c3", 3, "Ch 3: Matter \u2014 Structure and Properties (Pressure, Archimedes, Bernoulli, Surface Tension, Viscosity & Elasticity)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AA\u09A6\u09BE\u09B0\u09CD\u09A5: \u0997\u09A0\u09A8 \u0993 \u09A7\u09B0\u09CD\u09AE (\u099A\u09BE\u09AA, \u0986\u09B0\u09CD\u0995\u09BF\u09AE\u09BF\u09A1\u09BF\u09B8\u09C7\u09B0 \u09A8\u09C0\u09A4\u09BF, \u09AA\u09C3\u09B7\u09CD\u09A0\u099F\u09BE\u09A8, \u09B8\u09BE\u09A8\u09CD\u09A6\u09CD\u09B0\u09A4\u09BE \u0993 \u09B8\u09CD\u09A5\u09BF\u09A4\u09BF\u09B8\u09CD\u09A5\u09BE\u09AA\u0995\u09A4\u09BE)", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u092A\u0926\u093E\u0930\u094D\u0925: \u0938\u0902\u0930\u091A\u0928\u093E \u0914\u0930 \u0917\u0941\u0923\u0927\u0930\u094D\u092E (\u0926\u093E\u092C, \u0906\u0930\u094D\u0915\u093F\u092E\u093F\u0921\u0940\u091C \u0938\u093F\u0926\u094D\u0927\u093E\u0902\u0924, \u092A\u0943\u0937\u094D\u0920 \u0924\u0928\u093E\u0935, \u0936\u094D\u092F\u093E\u0928\u0924\u093E \u0914\u0930 \u092A\u094D\u0930\u0924\u094D\u092F\u093E\u0938\u094D\u0925\u0924\u093E)", ["Hydrostatic pressure P = h\u03C1g, barometer, siphon", "Archimedes' principle & floatation", "Bernoulli's theorem", "Surface tension, viscosity, Hooke's law & Young's modulus"], TB_PS_9),
        ch("ps9_c4_1", 4, "Ch 4.1 & 4.2: Atomic Structure & Mole Concept", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA.\u09E7 \u0993 \u09EA.\u09E8: \u09AA\u09B0\u09AE\u09BE\u09A3\u09C1\u09B0 \u0997\u09A0\u09A8 \u098F\u09AC\u0982 \u09AE\u09CB\u09B2\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 4.1 \u0935 4.2: \u092A\u0930\u092E\u093E\u0923\u0941 \u0915\u0940 \u0938\u0902\u0930\u091A\u0928\u093E \u0914\u0930 \u092E\u094B\u0932 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Rutherford & Bohr models", "Isotopes, isobars, isotones", "Avogadro's number (6.022 \xD7 10^23), molar mass, molar volume (22.4 L at STP)"], TB_PS_9),
        ch("ps9_c4_2", 5, "Ch 4.3 & 4.4: Solution and Acids, Bases & Salts", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA.\u09E9 \u0993 \u09EA.\u09EA: \u09A6\u09CD\u09B0\u09AC\u09A3 \u098F\u09AC\u0982 \u0985\u09CD\u09AF\u09BE\u09B8\u09BF\u09A1, \u0995\u09CD\u09B7\u09BE\u09B0 \u0993 \u09B2\u09AC\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 4.3 \u0935 4.4: \u0935\u093F\u0932\u092F\u0928 \u0924\u0925\u093E \u0905\u092E\u094D\u0932, \u0915\u094D\u0937\u093E\u0930 \u0914\u0930 \u0932\u0935\u0923", ["True solution, colloid, suspension, Tyndall effect", "Saturated, unsaturated, supersaturated solutions & solubility curves", "Arrhenius theory, pH scale, indicators, neutralization, antacids, acid rain"], TB_PS_9),
        ch("ps9_c4_3", 6, "Ch 4.5: Separation of Components of Mixtures & Water", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA.\u09EB \u0993 \u09EA.\u09EC: \u09AE\u09BF\u09B6\u09CD\u09B0\u09A3\u09C7\u09B0 \u0989\u09AA\u09BE\u09A6\u09BE\u09A8\u09C7\u09B0 \u09AA\u09C3\u09A5\u0995\u09C0\u0995\u09B0\u09A3 \u098F\u09AC\u0982 \u099C\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 4.5 \u0935 4.6: \u092E\u093F\u0936\u094D\u0930\u0923 \u0915\u0947 \u0918\u091F\u0915\u094B\u0902 \u0915\u093E \u092A\u0943\u0925\u0915\u094D\u0915\u0930\u0923 \u0914\u0930 \u091C\u0932", ["Fractional distillation, separating funnel, chromatography", "Hardness of water (temporary & permanent), ion-exchange resin, water pollution (Arsenic, Fluoride)"], TB_PS_9),
        ch("ps9_c5", 7, "Ch 5: Work, Power and Energy", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u0995\u09BE\u09B0\u09CD\u09AF, \u0995\u09CD\u09B7\u09AE\u09A4\u09BE \u0993 \u09B6\u0995\u09CD\u09A4\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u0915\u093E\u0930\u094D\u092F, \u0936\u0915\u094D\u0924\u093F \u0914\u0930 \u090A\u0930\u094D\u091C\u093E", ["Work W = F\xB7s cos\u03B8, Joule and Erg", "Power P = W/t, Watt and Horsepower (746 W)", "Kinetic energy (\xBDmv^2) & Potential energy (mgh)", "Conservation of mechanical energy in free fall"], TB_PS_9),
        ch("ps9_c6", 8, "Ch 6: Heat (Calorimetry, Latent Heat & Anomalous Expansion of Water)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09A4\u09BE\u09AA (\u0995\u09CD\u09AF\u09BE\u09B2\u09CB\u09B0\u09BF\u09AE\u09BF\u09A4\u09BF, \u09B2\u09C0\u09A8 \u09A4\u09BE\u09AA \u0993 \u099C\u09B2\u09C7\u09B0 \u09AC\u09CD\u09AF\u09A4\u09BF\u0995\u09CD\u09B0\u09AE\u09C0 \u09AA\u09CD\u09B0\u09B8\u09BE\u09B0\u09A3)", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u090A\u0937\u094D\u092E\u093E (\u0915\u0948\u0932\u094B\u0930\u0940\u092E\u093F\u0924\u093F, \u0917\u0941\u092A\u094D\u0924 \u090A\u0937\u094D\u092E\u093E \u0914\u0930 \u091C\u0932 \u0915\u093E \u0905\u0938\u0902\u0917\u0924 \u092A\u094D\u0930\u0938\u093E\u0930)", ["Principle of calorimetry Q = ms\u0394t", "Mechanical equivalent of heat W = JH", "Saturated vs unsaturated vapour, dew, fog", "Anomalous expansion of water (0\xB0C to 4\xB0C) and aquatic survival"], TB_PS_9),
        ch("ps9_c7", 9, "Ch 7: Sound (Waves, Echo, SONAR & Human Ear)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09B6\u09AC\u09CD\u09A6 (\u09A4\u09B0\u0999\u09CD\u0997, \u09AA\u09CD\u09B0\u09A4\u09BF\u09A7\u09CD\u09AC\u09A8\u09BF, SONAR \u0993 \u09AE\u09BE\u09A8\u09C1\u09B7\u09C7\u09B0 \u0995\u09B0\u09CD\u09A3)", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u0927\u094D\u0935\u0928\u093F (\u0924\u0930\u0902\u0917\u0947\u0902, \u092A\u094D\u0930\u0924\u093F\u0927\u09CD\u09AC\u0928\u093F, SONAR \u0914\u0930 \u092E\u093E\u0928\u0935 \u0915\u0930\u094D\u0923)", ["Longitudinal vs transverse waves", "v = n\u03BB (wave velocity, frequency, wavelength)", "Minimum distance for echo (16.6 m / 17 m in air)", "Infrasonic, audible (20 Hz\u201320 kHz), ultrasonic waves & SONAR"], TB_PS_9)
      ]
    },
    10: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_PS_10,
      syllabusVersion: "WBBSE Madhyamik Pariksha Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Bhouto Bigyan o Paribesh Class X (Units 1 to 8.6)",
      boardNote: {
        en: "Official WBBSE Class X Bhouto Bigyan o Paribesh (Madhyamik) \u2014 All 13 Verified Chapters across 8 Units.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u09AD\u09CC\u09A4\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995) \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E9\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC (\u09EE\u099F\u09BF \u098F\u0995\u0995)\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 10 \u092D\u094C\u0924\u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 (\u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E) \u2014 \u0938\u092D\u0940 13 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F (8 \u0907\u0915\u093E\u0907\u092F\u093E\u0901)\u0964"
      },
      chapters: [
        ch("ps10_c1", 1, "Ch 1: Concerns About Our Environment", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AD\u09BE\u09AC\u09A8\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0915\u0947 \u092A\u094D\u0930\u0924\u093F \u091A\u093F\u0902\u0924\u093E", ["Layers of atmosphere (Troposphere, Stratosphere, Mesosphere, Thermosphere)", "Ozone layer depletion (CFCs, Montreal Protocol)", "Greenhouse effect & Global warming", "Coalbed methane, biogas, solar/wind/tidal energy"], TB_PS_10),
        ch("ps10_c2", 2, "Ch 2: Behaviour of Gases", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u0997\u09CD\u09AF\u09BE\u09B8\u09C7\u09B0 \u0986\u099A\u09B0\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u0917\u0948\u0938\u094B\u0902 \u0915\u093E \u0935\u094D\u092F\u0935\u0939\u093E\u0930", ["Boyle's Law (PV = constant)", "Charles's Law & Absolute Zero (-273\xB0C = 0 K)", "Avogadro's Law", "Ideal Gas Equation PV = nRT, Graham diffusion law, Kinetic theory of gases"], TB_PS_10),
        ch("ps10_c3", 3, "Ch 3: Chemical Calculations", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09B0\u09BE\u09B8\u09BE\u09AF\u09BC\u09A8\u09BF\u0995 \u0997\u09A3\u09A8\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u0930\u093E\u0938\u093E\u092F\u0928\u093F\u0915 \u0917\u0923\u0928\u093E\u090F\u0901", ["Stoichiometric mass-mass, mass-volume, and volume-volume calculations at STP", "Vapour density and molecular weight relation (M = 2 \xD7 D)"], TB_PS_10),
        ch("ps10_c4", 4, "Ch 4: Thermal Phenomena", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09A4\u09BE\u09AA\u09C7\u09B0 \u0998\u099F\u09A8\u09BE\u09B8\u09AE\u09C2\u09B9", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u0924\u093E\u092A\u0940\u092F \u092A\u0930\u093F\u0918\u091F\u0928\u093E\u090F\u0901", ["Linear (\u03B1), superficial (\u03B2), and volume (\u03B3) expansion of solids (\u03B1 = \u03B2/2 = \u03B3/3)", "Real and apparent expansion of liquids", "Volume and pressure coefficients of gases", "Thermal conductivity & Wiedemann-Franz law"], TB_PS_10),
        ch("ps10_c5", 5, "Ch 5: Light", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u0986\u09B2\u09CB", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u092A\u094D\u0930\u0915\u093E\u0936", ["Concave and convex mirrors (r = 2f)", "Snell's law of refraction, refractive index, prism deviation \u03B4 = i1 + i2 - A", "Convex and concave lenses, magnification, power of lens", "Human eye defects (Myopia, Hypermetropia), dispersion, Rayleigh scattering (1/\u03BB^4)"], TB_PS_10),
        ch("ps10_c6", 6, "Ch 6: Current Electricity", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u099A\u09B2\u09A4\u09A1\u09BC\u09BF\u09CE", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u0927\u093E\u0930\u093E \u0935\u093F\u0926\u094D\u092F\u0941\u0924", ["Coulomb's law, potential difference, EMF", "Ohm's Law, resistivity, series & parallel resistors", "Joule's heating law H = I^2Rt, electric power (kWh / BOT unit)", "Fleming's Left-Hand Rule, Barlow's wheel, Faraday's electromagnetic induction, Lenz's law, AC/DC dynamo & motor, domestic wiring (earth, live, neutral)"], TB_PS_10),
        ch("ps10_c7", 7, "Ch 7: Atomic Nucleus (Radioactivity, Fission & Fusion)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09AA\u09B0\u09AE\u09BE\u09A3\u09C1\u09B0 \u09A8\u09BF\u0989\u0995\u09CD\u09B2\u09BF\u09AF\u09BC\u09BE\u09B8", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u092A\u0930\u092E\u093E\u0923\u0941 \u0928\u093E\u092D\u093F\u0915", ["Properties of \u03B1, \u03B2, \u03B3 rays", "Radioactive decay laws", "Mass defect & Einstein E = mc^2", "Nuclear fission (chain reaction, nuclear reactor) & nuclear fusion (solar energy)"], TB_PS_10),
        ch("ps10_c8_1", 8, "Ch 8.1: Periodic Table and Periodicity of Properties of Elements", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE.\u09E7: \u09AA\u09B0\u09CD\u09AF\u09BE\u09AF\u09BC \u09B8\u09BE\u09B0\u09A3\u09BF \u098F\u09AC\u0982 \u09AE\u09CC\u09B2\u09C7\u09B0 \u09A7\u09B0\u09CD\u09AE\u09C7\u09B0 \u09AA\u09B0\u09CD\u09AF\u09BE\u09AC\u09C3\u09A4\u09CD\u09A4\u09A4\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 8.1: \u0906\u0935\u0930\u094D\u0924 \u0938\u093E\u0930\u0923\u0940 \u0914\u0930 \u0924\u0924\u094D\u0935\u094B\u0902 \u0915\u0947 \u0917\u0941\u0923\u094B\u0902 \u0915\u0940 \u0906\u0935\u0930\u094D\u0924\u093F\u0924\u093E", ["Dobereiner's triads, Mendeleev's & Modern Periodic Law (Moseley)", "18 groups & 7 periods", "Periodic trends: atomic radius, ionization energy, electronegativity, oxidizing/reducing power"], TB_PS_10),
        ch("ps10_c8_2", 9, "Ch 8.2: Ionic and Covalent Bonding", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE.\u09E8: \u0986\u09AF\u09BC\u09A8\u09C0\u09AF\u09BC \u0993 \u09B8\u09AE\u09AF\u09CB\u099C\u09C0 \u09AC\u09A8\u09CD\u09A7\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 8.2: \u0906\u092F\u0928\u093F\u0915 \u0914\u0930 \u0938\u0939\u0938\u0902\u092F\u094B\u091C\u0915 \u0906\u092C\u0902\u0927\u0928", ["Electrovalent (ionic) compounds (NaCl, MgO, CaO)", "Lewis dot structures of covalent molecules (H2O, NH3, CH4, CO2, C2H4, C2H2)", "Comparison of properties of ionic and covalent compounds"], TB_PS_10),
        ch("ps10_c8_3", 10, "Ch 8.3: Electricity and Chemical Reactions (Electrolysis)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE.\u09E9: \u09A4\u09A1\u09BC\u09BF\u09CE\u09AA\u09CD\u09B0\u09AC\u09BE\u09B9 \u0993 \u09B0\u09BE\u09B8\u09BE\u09AF\u09BC\u09A8\u09BF\u0995 \u09AC\u09BF\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 8.3: \u0935\u093F\u0926\u094D\u092F\u0941\u0924 \u0927\u093E\u0930\u093E \u0914\u0930 \u0930\u093E\u0938\u093E\u092F\u0928\u093F\u0915 \u0905\u092D\u093F\u0915\u094D\u0930\u093F\u092F\u093E\u090F\u0901 (\u0935\u093F\u0926\u094D\u092F\u0941\u0924-\u0905\u092A\u0918\u091F\u0928)", ["Strong and weak electrolytes", "Cathode (reduction) and anode (oxidation)", "Electrolysis of acidulated water & CuSO4 solution", "Electroplating with Ni, Cu, Ag, Au and electro-refining of copper"], TB_PS_10),
        ch("ps10_c8_4", 11, "Ch 8.4: Inorganic Chemistry in the Laboratory and in Industry", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE.\u09EA: \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE\u0997\u09BE\u09B0 \u0993 \u09B0\u09BE\u09B8\u09BE\u09AF\u09BC\u09A8\u09BF\u0995 \u09B6\u09BF\u09B2\u09CD\u09AA\u09C7 \u0985\u099C\u09C8\u09AC \u09B0\u09B8\u09BE\u09AF\u09BC\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 8.4: \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E \u0914\u0930 \u0930\u093E\u0938\u093E\u092F\u0928\u093F\u0915 \u0909\u0926\u094D\u092F\u094B\u0917 \u092E\u0947\u0902 \u0905\u0915\u093E\u0930\u094D\u092C\u0928\u093F\u0915 \u0930\u0938\u093E\u092F\u0928", ["Lab preparation, drying & properties of NH3 and H2S, Nessler reagent", "Haber process (NH3), Ostwald process (HNO3), Contact process (H2SO4 & oleum)", "Urea manufacture"], TB_PS_10),
        ch("ps10_c8_5", 12, "Ch 8.5: Metallurgy", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE.\u09EB: \u09A7\u09BE\u09A4\u09C1\u09AC\u09BF\u09A6\u09CD\u09AF\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 8.5: \u0927\u093E\u0924\u0941\u0915\u0930\u094D\u092E", ["Ores of Fe (haematite), Cu (copper pyrites), Zn (zinc blende), Al (bauxite)", "Thermite process, electrolytic reduction of alumina", "Alloys (brass, bronze, duralumin, stainless steel)", "Rusting of iron and galvanization"], TB_PS_10),
        ch("ps10_c8_6", 13, "Ch 8.6: Organic Chemistry", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE.6: \u099C\u09C8\u09AC \u09B0\u09B8\u09BE\u09AF\u09BC\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 8.6: \u0915\u093E\u0930\u094D\u092C\u0928\u093F\u0915 \u0930\u0938\u093E\u092F\u0928", ["Catenation & tetravalency of carbon", "Alkanes, alkenes, alkynes, functional groups (-OH, -CHO, >C=O, -COOH)", "Structural & functional isomerism, IUPAC nomenclature", "Reactions of methane, ethylene, acetylene, ethanol, acetic acid; PVC, Teflon, polythene"], TB_PS_10)
      ]
    }
  }
};
var LIFE_SCIENCE_SUBJECT = {
  id: "life_science",
  name: {
    en: "Life Science",
    bn: "\u099C\u09C0\u09AC\u09A8 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 (Life Science)",
    hi: "\u091C\u0940\u0935\u0928 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 (Life Science)"
  },
  shortDesc: {
    en: "Biology, physiology, cell division, genetics, evolution, plant & animal hormones, nervous system, and ecology from WBBSE Jiban Bigyan o Paribesh.",
    bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6\u09C7\u09B0 \u099C\u09C0\u09AC\u09A8 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u09B6\u09BE\u09B0\u09C0\u09B0\u09AC\u09BF\u09A6\u09CD\u09AF\u09BE, \u0995\u09CB\u09B7 \u09AC\u09BF\u09AD\u09BE\u099C\u09A8, \u09AC\u0982\u09B6\u0997\u09A4\u09BF, \u0985\u09AD\u09BF\u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF \u0993 \u09AC\u09BE\u09B8\u09CD\u09A4\u09C1\u09AC\u09BF\u09A6\u09CD\u09AF\u09BE\u0964",
    hi: "WBBSE \u091C\u0940\u0935\u0928 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u0938\u0947 \u0936\u0930\u0940\u0930 \u0915\u094D\u0930\u093F\u092F\u093E \u0935\u093F\u091C\u094D\u091E\u093E\u0928, \u0915\u094B\u0936\u093F\u0915\u093E \u0935\u093F\u092D\u093E\u091C\u0928, \u0906\u0928\u0941\u0935\u0902\u0936\u093F\u0915\u0940, \u0935\u093F\u0915\u093E\u0938 \u0914\u0930 \u092A\u093E\u0930\u093F\u0938\u094D\u0925\u093F\u0924\u093F\u0915\u0940\u0964"
  },
  domainGuardKeywords: [
    "cell",
    "photosynthesis",
    "respiration",
    "hormone",
    "nervous",
    "neuron",
    "mitosis",
    "meiosis",
    "dna",
    "chromosome",
    "mendel",
    "genetics",
    "evolution",
    "darwin",
    "ecosystem",
    "biodiversity"
  ],
  curriculumByClass: {
    5: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_EVS_5,
      syllabusVersion: "WBBPE Primary Syllabus",
      officialSource: "WBBPE \u2014 Amader Paribesh Class V",
      boardNote: {
        en: "Integrated in Class 5 Amader Paribesh (Human Body, Biodiversity, Forests & Agriculture).",
        bn: "\u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u09AE\u09BE\u09A8\u09AC\u09A6\u09C7\u09B9 \u0993 \u099C\u09C0\u09AC\u09AC\u09C8\u099A\u09BF\u09A4\u09CD\u09B0\u09CD\u09AF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u09C7\u09B0 \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09AD\u09C1\u0995\u09CD\u09A4\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 5 \u092E\u0947\u0902 \u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0930\u093F\u0935\u0947\u0936 (\u092E\u093E\u0928\u0935 \u0936\u0930\u0940\u0930 \u0914\u0930 \u091C\u0948\u0935 \u0935\u093F\u0935\u093F\u0927\u0924\u093E) \u092E\u0947\u0902 \u0938\u092E\u093E\u0939\u093F\u0924\u0964"
      },
      chapters: [
        EVS_SUBJECT.curriculumByClass[5].chapters[0],
        EVS_SUBJECT.curriculumByClass[5].chapters[1],
        EVS_SUBJECT.curriculumByClass[5].chapters[3],
        EVS_SUBJECT.curriculumByClass[5].chapters[4]
      ]
    },
    6: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_SCI_6,
      syllabusVersion: "WBBSE Upper Primary Syllabus",
      officialSource: "WBBSE \u2014 Paribesh o Bigyan Class VI (Biological & Environmental Chapters)",
      boardNote: {
        en: "In Class 6, Life & Environmental Science is part of the prescribed Paribesh o Bigyan textbook.",
        bn: "\u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u099C\u09C0\u09AC\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u0985\u0982\u09B6\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 6 \u092E\u0947\u0902 \u091C\u0940\u0935\u0928 \u0935 \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u09AA\u09BE\u09A0\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u0915\u093E \u0939\u093F\u0938\u094D\u0938\u093E \u0939\u0948\u0964"
      },
      chapters: [
        CLASS_6_SCIENCE_CHAPTERS[0],
        CLASS_6_SCIENCE_CHAPTERS[7],
        CLASS_6_SCIENCE_CHAPTERS[9],
        CLASS_6_SCIENCE_CHAPTERS[10],
        CLASS_6_SCIENCE_CHAPTERS[11]
      ]
    },
    7: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_SCI_7,
      syllabusVersion: "WBBSE Upper Primary Syllabus",
      officialSource: "WBBSE \u2014 Paribesh o Bigyan Class VII (Biological & Environmental Chapters)",
      boardNote: {
        en: "In Class 7, Life & Environmental Science is part of the prescribed Paribesh o Bigyan textbook.",
        bn: "\u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u099C\u09C0\u09AC\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u0985\u0982\u09B6\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 7 \u092E\u0947\u0902 \u091C\u0940\u0935\u0928 \u0935 \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u09AA\u09BE\u09A0\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u0915\u093E \u0939\u093F\u0938\u094D\u0938\u093E \u0939\u0948\u0964"
      },
      chapters: [
        CLASS_7_SCIENCE_CHAPTERS[4],
        CLASS_7_SCIENCE_CHAPTERS[5],
        CLASS_7_SCIENCE_CHAPTERS[6],
        CLASS_7_SCIENCE_CHAPTERS[7],
        CLASS_7_SCIENCE_CHAPTERS[8]
      ]
    },
    8: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_SCI_8,
      syllabusVersion: "WBBSE Upper Primary Syllabus",
      officialSource: "WBBSE \u2014 Paribesh o Bigyan Class VIII (Biological & Environmental Chapters)",
      boardNote: {
        en: "In Class 8, Life & Environmental Science is part of the prescribed Paribesh o Bigyan textbook.",
        bn: "\u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u099C\u09C0\u09AC\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u0985\u0982\u09B6\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 8 \u092E\u0947\u0902 \u091C\u0940\u0935\u0928 \u0935 \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u0930\u093F\u0935\u0947\u0936 \u0913 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u09AA\u09BE\u09A0\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u0915\u093E \u0939\u093F\u0938\u094D\u0938\u093E \u0939\u0948\u0964"
      },
      chapters: [
        CLASS_8_SCIENCE_CHAPTERS[5],
        CLASS_8_SCIENCE_CHAPTERS[6],
        CLASS_8_SCIENCE_CHAPTERS[7],
        CLASS_8_SCIENCE_CHAPTERS[8],
        CLASS_8_SCIENCE_CHAPTERS[9],
        CLASS_8_SCIENCE_CHAPTERS[10]
      ]
    },
    9: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_LS_9,
      syllabusVersion: "WBBSE Secondary Curriculum (Current Edition)",
      officialSource: "WBBSE \u2014 Jiban Bigyan o Paribesh Class IX (Chapters 1\u20135)",
      boardNote: {
        en: "Official WBBSE Class IX Jiban Bigyan o Paribesh \u2014 All 5 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u099C\u09C0\u09AC\u09A8 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09EB\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 9 \u091C\u0940\u0935\u0928 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 \u2014 \u0938\u092D\u0940 5 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("ls9_c1", 1, "Ch 1: Life and Its Diversity (Origin of Life, Taxonomy & Five Kingdoms)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u099C\u09C0\u09AC\u09A8 \u0993 \u09A4\u09BE\u09B0 \u09AC\u09C8\u099A\u09BF\u09A4\u09CD\u09B0\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u091C\u0940\u0935\u0928 \u0914\u0930 \u0909\u0938\u0915\u0940 \u0935\u093F\u0935\u093F\u0927\u0924\u093E", ["Oparin-Haldane chemosynthetic origin of life", "Binomial nomenclature (Linnaeus)", "Whittaker Five Kingdom classification", "Characteristics of Plantae & Animalia phyla (Porifera to Chordata)"], TB_LS_9),
        ch("ls9_c2", 2, "Ch 2: Levels of Organization of Life (Biomolecules, Cell Organelles, Tissues & Organs)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u099C\u09C0\u09AC\u09A8 \u09B8\u0982\u0997\u09A0\u09A8\u09C7\u09B0 \u09B8\u09CD\u09A4\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u091C\u0940\u0935\u0928 \u0938\u0902\u0917\u0920\u0928 \u0915\u0947 \u0938\u094D\u0924\u0930", ["Carbohydrates, proteins, lipids, nucleic acids (DNA/RNA), vitamins & minerals", "Structure & function of cell organelles", "Meristematic & permanent plant tissues (xylem, phloem)", "Epithelial, connective, muscular, and nervous animal tissues"], TB_LS_9),
        ch("ls9_c3", 3, "Ch 3: Physiological Processes of Life (Photosynthesis, Transpiration, Respiration, Nutrition, Circulation & Excretion)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u099C\u09C8\u09AC\u09A8\u09BF\u0995 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u091C\u0948\u0935\u093F\u0915 \u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E\u090F\u0901 (\u092A\u094D\u0930\u0915\u093E\u0936 \u0938\u0902\u0936\u094D\u0932\u0947\u0937\u0923, \u0936\u094D\u0935\u0938\u0928, \u092A\u094B\u0937\u0923, \u092A\u0930\u093F\u0938\u0902\u091A\u0930\u0923 \u0914\u0930 \u0909\u0924\u094D\u0938\u0930\u094D\u091C\u0928)", ["Light-dependent & Calvin cycle stages of photosynthesis", "Transpiration & ascent of sap", "Glycolysis, Krebs cycle, aerobic vs anaerobic respiration", "Human digestive system & BMR", "ABO/Rh blood groups, double circulation, cardiac cycle", "Nephron structure & urine formation"], TB_LS_9),
        ch("ls9_c4", 4, "Ch 4: Biology and Human Welfare (Immunity, Vaccination, Pathogens & Microbes)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u099C\u09C0\u09AC\u09AC\u09BF\u09A6\u09CD\u09AF\u09BE \u0993 \u09AE\u09BE\u09A8\u09AC\u0995\u09B2\u09CD\u09AF\u09BE\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u091C\u0940\u0935 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0914\u0930 \u092E\u093E\u0928\u0935 \u0915\u0932\u094D\u092F\u093E\u0923 (\u092A\u094D\u0930\u0924\u093F\u0930\u0915\u094D\u0937\u093E, \u091F\u0940\u0915\u093E\u0915\u0930\u0923 \u0914\u0930 \u0930\u094B\u0917\u093E\u0923\u0941)", ["Antigen-antibody interaction, innate & acquired immunity", "Vaccination (BCG, DPT, OPV, MMR)", "Diseases: Diarrhoea, Malaria, Diphtheria, Pneumonia, Tetanus, Tuberculosis, Dengue, Hepatitis, AIDS", "Microbes in biofertilizers & biological control"], TB_LS_9),
        ch("ls9_c5", 5, "Ch 5: Environment and Its Resources (Ecology, Energy Flow & Conservation)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u0993 \u09A4\u09BE\u09B0 \u09B8\u09AE\u09CD\u09AA\u09A6", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0914\u0930 \u0909\u0938\u0915\u0947 \u0938\u0902\u0938\u093E\u0927\u0928", ["Population & community ecology (predation, parasitism, competition, mutualism)", "Food chain, food web, Lindeman 10% energy flow law", "Carbon, Oxygen, and Water cycles", "Conservation of water, forest, food & energy"], TB_LS_9)
      ]
    },
    10: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_LS_10,
      syllabusVersion: "WBBSE Madhyamik Pariksha Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Jiban Bigyan o Paribesh Class X (Chapters 1\u20135)",
      boardNote: {
        en: "Official WBBSE Class X Jiban Bigyan o Paribesh (Madhyamik Pariksha) \u2014 All 5 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u099C\u09C0\u09AC\u09A8 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995) \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09EB\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 10 \u091C\u0940\u0935\u0928 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 (\u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E) \u2014 \u0938\u092D\u0940 5 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("ls10_c1", 1, "Ch 1: Control and Coordination in Living Organisms", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u099C\u09C0\u09AC\u099C\u0997\u09A4\u09C7 \u09A8\u09BF\u09AF\u09BC\u09A8\u09CD\u09A4\u09CD\u09B0\u09A3 \u0993 \u09B8\u09AE\u09A8\u09CD\u09AC\u09AF\u09BC", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u091C\u0940\u0935 \u091C\u0917\u0924 \u092E\u0947\u0902 \u0928\u093F\u092F\u0902\u0924\u094D\u0930\u0923 \u0914\u0930 \u0938\u092E\u0928\u094D\u0935\u092F", ["Tactic, tropic, and nastic movements in plants", "Plant hormones: Auxin, Gibberellin, Cytokinin", "Endocrine glands & animal hormones (Pituitary, Thyroid, Adrenal, Pancreas, Gonads) & feedback control", "Neuron, synapse, reflex arc, human brain & eye, locomotion in Amoeba, Paramoecium, Euglena, Fish, Bird & Human"], TB_LS_10),
        ch("ls10_c2", 2, "Ch 2: Continuity of Life (Chromosomes, Cell Division, Reproduction & Growth)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u099C\u09C0\u09AC\u09A8\u09C7\u09B0 \u09AA\u09CD\u09B0\u09AC\u09BE\u09B9\u09AE\u09BE\u09A8\u09A4\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u091C\u0940\u0935\u0928 \u0915\u0940 \u0928\u093F\u0930\u0902\u0924\u0930\u0924\u093E (\u0917\u0941\u0923\u0938\u0942\u0924\u094D\u0930, \u0915\u094B\u0936\u093F\u0915\u093E \u0935\u093F\u092D\u093E\u091C\u0928 \u0914\u0930 \u092A\u094D\u0930\u091C\u0928\u0928)", ["Chromosome morphology (centromere, telomere, satellite), euchromatin & heterochromatin, DNA & RNA", "Cell cycle (Interphase G1, S, G2) & Amitosis, Mitosis (Prophase, Metaphase, Anaphase, Telophase, Cytokinesis), Meiosis", "Asexual & vegetative propagation (micropropagation), alternation of\u4E16\u4EE3 in fern, double fertilization in angiosperms"], TB_LS_10),
        ch("ls10_c3", 3, "Ch 3: Heredity and Several Common Genetic Diseases", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AC\u0982\u09B6\u0997\u09A4\u09BF \u098F\u09AC\u0982 \u0995\u09DF\u09C7\u0995\u099F\u09BF \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u099C\u09BF\u09A8\u0997\u09A4 \u09B0\u09CB\u0997", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u0906\u0928\u0941\u0935\u0902\u0936\u093F\u0915\u0940 \u0914\u0930 \u0915\u0941\u091B \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0906\u0928\u0941\u0935\u0902\u0936\u093F\u0915 \u0930\u094B\u0917", ["Mendel's monohybrid (3:1, 1:2:1) & dihybrid (9:3:3:1) crosses", "Law of Segregation & Law of Independent Assortment", "Incomplete dominance in Mirabilis jalapa (1:2:1)", "Sex determination in humans (XX-XY)", "Thalassemia (\u03B1 & \u03B2), Haemophilia (A & B), and Colour blindness, genetic counselling"], TB_LS_10),
        ch("ls10_c4", 4, "Ch 4: Evolution and Adaptation", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u0985\u09AD\u09BF\u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF \u0993 \u0985\u09AD\u09BF\u09AF\u09CB\u099C\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u0935\u093F\u0915\u093E\u0938 \u0914\u0930 \u0905\u0928\u0941\u0915\u0942\u0932\u0928", ["Miller-Urey experiment", "Lamarckism (use & disuse, inheritance of acquired characters) & Darwinism (natural selection, survival of the fittest)", "Evidences of evolution: Eohippus to Equus fossil series, homologous & analogous organs, vestigial organs, vertebrate hearts & embryos", "Adaptations in Cactus (xerophyte), Sundari (halophyte), Rohu (swim bladder), Pigeon (air sacs), Camel, Chimpanzee, and Honeybee waggle dance"], TB_LS_10),
        ch("ls10_c5", 5, "Ch 5: Environment, Its Resources and Their Conservation", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6, \u09A4\u09BE\u09B0 \u09B8\u09AE\u09CD\u09AA\u09A6 \u098F\u09AC\u0982 \u09A4\u09BE\u09A6\u09C7\u09B0 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923, \u0909\u0938\u0915\u0947 \u0938\u0902\u0938\u093E\u0927\u0928 \u0914\u0930 \u0909\u0928\u0915\u093E \u0938\u0902\u0930\u0915\u094D\u0937\u0923", ["Steps of Nitrogen cycle (fixation, ammonification, nitrification, denitrification)", "Air, water, soil, and noise pollution (BOD, eutrophication, biomagnification, asthma, bronchitis)", "4 Biodiversity Hotspots of India (Eastern Himalayas, Indo-Burma, Western Ghats, Sundaland)", "In-situ (National Park, Sanctuary, Biosphere Reserve) & Ex-situ (Zoological/Botanical Garden, Cryopreservation), JFM & PBR, Conservation of Tiger, Rhino, Lion, Crocodile & Red Panda"], TB_LS_10)
      ]
    }
  }
};

// src/data/curriculumSocial.ts
var TB_EVS_52 = {
  en: "Amader Paribesh (Class V \u2014 WBBPE)",
  bn: "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBPE)",
  hi: "\u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0930\u093F\u0935\u0947\u0936 (\u0915\u0915\u094D\u0937\u093E 5 \u2014 WBBPE)"
};
var TB_HIST_6 = {
  en: "Atit o Aitihya (Class VI \u2014 WBBSE)",
  bn: "\u0985\u09A4\u09C0\u09A4 \u0993 \u0990\u09A4\u09BF\u09B9\u09CD\u09AF (\u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0905\u0924\u0940\u0924 \u0913 \u0910\u0924\u093F\u0939\u094D\u092F (\u0915\u0915\u094D\u0937\u093E 6 \u2014 WBBSE)"
};
var TB_HIST_7 = {
  en: "Atit o Aitihya (Class VII \u2014 WBBSE)",
  bn: "\u0985\u09A4\u09C0\u09A4 \u0993 \u0990\u09A4\u09BF\u09B9\u09CD\u09AF (\u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0905\u0924\u0940\u0924 \u0913 \u0910\u0924\u093F\u0939\u094D\u092F (\u0915\u0915\u094D\u0937\u093E 7 \u2014 WBBSE)"
};
var TB_HIST_8 = {
  en: "Atit o Aitihya (Class VIII \u2014 WBBSE)",
  bn: "\u0985\u09A4\u09C0\u09A4 \u0993 \u0990\u09A4\u09BF\u09B9\u09CD\u09AF (\u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0905\u0924\u0940\u0924 \u0913 \u0910\u0924\u093F\u0939\u094D\u092F (\u0915\u0915\u094D\u0937\u093E 8 \u2014 WBBSE)"
};
var TB_HIST_9 = {
  en: "Itihas o Paribesh (Class IX \u2014 WBBSE)",
  bn: "\u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0907\u0924\u093F\u0939\u093E\u0938 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 (\u0915\u0915\u094D\u0937\u093E 9 \u2014 WBBSE)"
};
var TB_HIST_10 = {
  en: "Itihas o Paribesh (Class X \u2014 WBBSE Madhyamik)",
  bn: "\u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995)",
  hi: "\u0907\u0924\u093F\u0939\u093E\u0938 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 (\u0915\u0915\u094D\u0937\u093E 10 \u2014 WBBSE \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915)"
};
var TB_GEO_6 = {
  en: "Amader Prithibi (Class VI \u2014 WBBSE)",
  bn: "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0 (\u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0943\u0925\u093F\u0935\u0940 (\u0915\u0915\u094D\u0937\u093E 6 \u2014 WBBSE)"
};
var TB_GEO_7 = {
  en: "Amader Prithibi (Class VII \u2014 WBBSE)",
  bn: "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0 (\u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0943\u0925\u093F\u0935\u0940 (\u0915\u0915\u094D\u0937\u093E 7 \u2014 WBBSE)"
};
var TB_GEO_8 = {
  en: "Amader Prithibi (Class VIII \u2014 WBBSE)",
  bn: "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0 (\u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0943\u0925\u093F\u0935\u0940 (\u0915\u0915\u094D\u0937\u093E 8 \u2014 WBBSE)"
};
var TB_GEO_9 = {
  en: "Bhugol o Paribesh (Class IX \u2014 WBBSE)",
  bn: "\u09AD\u09C2\u0997\u09CB\u09B2 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u092D\u0942\u0917\u094B\u0932 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 (\u0915\u0915\u094D\u0937\u093E 9 \u2014 WBBSE)"
};
var TB_GEO_10 = {
  en: "Bhugol o Paribesh (Class X \u2014 WBBSE Madhyamik)",
  bn: "\u09AD\u09C2\u0997\u09CB\u09B2 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995)",
  hi: "\u092D\u0942\u0917\u094B\u0932 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 (\u0915\u0915\u094D\u0937\u093E 10 \u2014 WBBSE \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915)"
};
var HISTORY_SUBJECT = {
  id: "history",
  name: {
    en: "History",
    bn: "\u0987\u09A4\u09BF\u09B9\u09BE\u09B8 (History)",
    hi: "\u0907\u0924\u093F\u0939\u093E\u0938 (History)"
  },
  shortDesc: {
    en: "Ancient, medieval, modern Indian & European history from official WBBSE Atit o Aitihya and Itihas o Paribesh textbooks.",
    bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6\u09C7\u09B0 \u0985\u09A4\u09C0\u09A4 \u0993 \u0990\u09A4\u09BF\u09B9\u09CD\u09AF \u098F\u09AC\u0982 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u099A\u09C0\u09A8, \u09AE\u09A7\u09CD\u09AF\u09AF\u09C1\u0997\u09C0\u09AF\u09BC \u0993 \u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u09AD\u09BE\u09B0\u09A4\u09C7\u09B0 \u098F\u09AC\u0982 \u0987\u0989\u09B0\u09CB\u09AA\u09C7\u09B0 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8\u0964",
    hi: "WBBSE \u0915\u0940 \u0905\u0924\u0940\u0924 \u0913 \u0910\u0924\u093F\u0939\u094D\u092F \u0914\u0930 \u0907\u0924\u093F\u0939\u093E\u0938 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915\u094B\u0902 \u0938\u0947 \u092A\u094D\u0930\u093E\u091A\u0940\u0928, \u092E\u0927\u094D\u092F\u0915\u093E\u0932\u0940\u0928 \u0914\u0930 \u0906\u0927\u0941\u0928\u093F\u0915 \u092D\u093E\u0930\u0924\u0940\u092F \u090F\u0935\u0902 \u092F\u0942\u0930\u094B\u092A\u0940\u092F \u0907\u0924\u093F\u0939\u093E\u0938\u0964"
  },
  domainGuardKeywords: [
    "history",
    "civilization",
    "harappa",
    "vedic",
    "maurya",
    "gupta",
    "sultanate",
    "mughal",
    "colonial",
    "revolt",
    "nationalism",
    "renaissance",
    "revolution"
  ],
  curriculumByClass: {
    5: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_EVS_52,
      syllabusVersion: "WBBPE Primary Syllabus",
      officialSource: "WBBPE \u2014 Amader Paribesh Class V (Heritage & Freedom Struggle Units)",
      boardNote: {
        en: "In Class 5, History & Heritage are integrated into Amader Paribesh.",
        bn: "\u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u0993 \u0990\u09A4\u09BF\u09B9\u09CD\u09AF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09AD\u09C1\u0995\u09CD\u09A4\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 5 \u092E\u0947\u0902 \u0907\u0924\u093F\u0939\u093E\u0938 \u0914\u0930 \u0935\u093F\u0930\u093E\u0938\u0924 \u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0930\u093F\u0935\u0947\u0936 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u092E\u0947\u0902 \u0938\u092E\u093E\u0939\u093F\u0924 \u0939\u0948\u0902\u0964"
      },
      chapters: [
        ch("h5_c1", 1, "Ch 7: Evolution of Wheel, Boats, Steam Engine & Early Railways in Bengal", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u099A\u09BE\u0995\u09BE, \u09A8\u09CC\u0995\u09BE, \u09AC\u09BE\u09B7\u09CD\u09AA\u09C0\u09AF\u09BC \u0987\u099E\u09CD\u099C\u09BF\u09A8 \u0993 \u09AC\u09BE\u0982\u09B2\u09BE\u09B0 \u09AA\u09CD\u09B0\u09A5\u09AE \u09B0\u09C7\u09B2\u09AA\u09A5\u09C7\u09B0 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u092A\u0939\u093F\u092F\u093E, \u0928\u093E\u0935, \u092D\u093E\u092A \u0907\u0902\u091C\u0928 \u0914\u0930 \u092C\u0902\u0917\u093E\u0932 \u092E\u0947\u0902 \u092A\u094D\u0930\u0925\u092E \u0930\u0947\u0932\u0935\u0947 \u0915\u093E \u0907\u0924\u093F\u0939\u093E\u0938", ["Invention of wheel", "Howrah to Hooghly first train in Eastern India (1854)", "Historic architecture & monuments of Bengal"], TB_EVS_52),
        ch("h5_c2", 2, "Ch 9: Bengal Renaissance, Social Reformers & Freedom Struggle Martyrs", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u09AC\u09BE\u0982\u09B2\u09BE\u09B0 \u09A8\u09AC\u099C\u09BE\u0997\u09B0\u09A3, \u09B8\u09AE\u09BE\u099C \u09B8\u0982\u09B8\u09CD\u0995\u09BE\u09B0\u0995 \u0993 \u09B8\u09CD\u09AC\u09BE\u09A7\u09C0\u09A8\u09A4\u09BE \u09B8\u0982\u0997\u09CD\u09B0\u09BE\u09AE\u09C7\u09B0 \u09B6\u09B9\u09BF\u09A6\u0997\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u092C\u0902\u0917\u093E\u0932 \u092A\u0941\u0928\u0930\u094D\u091C\u093E\u0917\u0930\u0923, \u0938\u092E\u093E\u091C \u0938\u0941\u0927\u093E\u0930\u0915 \u0914\u0930 \u0938\u094D\u0935\u0924\u0902\u0924\u094D\u0930\u0924\u093E \u0938\u0902\u0917\u094D\u0930\u093E\u092E \u0915\u0947 \u0936\u0939\u0940\u0926", ["Raja Rammohan Roy, Ishwar Chandra Vidyasagar, Rabindranath Tagore, Begum Rokeya, Swami Vivekananda", "Sidhu-Kanhu (Santhal Hul), Birsa Munda, Khudiram Bose, Surya Sen (Masterda), Pritilata Waddedar, Matangini Hazra, Netaji Subhas Chandra Bose"], TB_EVS_52)
      ]
    },
    6: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_HIST_6,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Atit o Aitihya Class VI (Chapters 1\u20139)",
      boardNote: {
        en: "Official WBBSE Class VI Atit o Aitihya (History) \u2014 All 9 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0985\u09A4\u09C0\u09A4 \u0993 \u0990\u09A4\u09BF\u09B9\u09CD\u09AF (\u0987\u09A4\u09BF\u09B9\u09BE\u09B8) \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09EF\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 6 \u0905\u0924\u0940\u0924 \u0913 \u0910\u0924\u093F\u0939\u094D\u092F (\u0907\u0924\u093F\u0939\u093E\u0938) \u2014 \u0938\u092D\u0940 9 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("h6_c1", 1, "Ch 1: Introductory Concept of History (Geography of Indian Subcontinent & Sources)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u0987\u09A4\u09BF\u09B9\u09BE\u09B8\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u0907\u0924\u093F\u0939\u093E\u0938 \u0915\u0940 \u092A\u094D\u0930\u093E\u0930\u0902\u092D\u093F\u0915 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Bharata-varsha and Jambudvipa", "BCE and CE timeline, Saka & Vikrama eras", "Archaeological inscriptions, coins, monuments & literary sources"], TB_HIST_6),
        ch("h6_c2", 2, "Ch 2: Primitive Humans in the Indian Subcontinent (Nomadic Life to Permanent Settlement)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09AD\u09BE\u09B0\u09A4\u09C0\u09AF\u09BC \u0989\u09AA\u09AE\u09B9\u09BE\u09A6\u09C7\u09B6\u09C7 \u0986\u09A6\u09BF\u09AE \u09AE\u09BE\u09A8\u09C1\u09B7 (\u09AF\u09BE\u09AF\u09BE\u09AC\u09B0 \u099C\u09C0\u09AC\u09A8 \u09A5\u09C7\u0995\u09C7 \u09B8\u09CD\u09A5\u09BE\u09AF\u09BC\u09C0 \u09AC\u09B8\u09A4\u09BF \u0997\u09A1\u09BC\u09C7 \u0993\u09A0\u09BE)", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u092D\u093E\u0930\u0924\u0940\u092F \u0909\u092A\u092E\u0939\u093E\u0926\u094D\u0935\u0940\u092A \u092E\u0947\u0902 \u0906\u0926\u093F\u092E \u092E\u093E\u0928\u0935 (\u0916\u093E\u0928\u093E\u092C\u0926\u094B\u0936 \u091C\u0940\u0935\u0928 \u0938\u0947 \u0938\u094D\u0925\u093E\u092F\u0940 \u092C\u0938\u094D\u0924\u0940 \u0924\u0915)", ["Hominid evolution", "Palaeolithic, Mesolithic, Neolithic stone tools", "Bhimbetka cave paintings, discovery of fire, wheel & Mehrgarh agriculture"], TB_HIST_6),
        ch("h6_c3", 3, "Ch 3: Ancient Urban Civilization in the Indian Subcontinent (Mehrgarh & Harappa)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AD\u09BE\u09B0\u09A4\u09C0\u09AF\u09BC \u0989\u09AA\u09AE\u09B9\u09BE\u09A6\u09C7\u09B6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u099A\u09C0\u09A8 \u09A8\u0997\u09B0\u09C7\u09B0 \u0995\u09A5\u09BE (\u09AE\u09C7\u09B9\u09C7\u09B0\u0997\u09A1\u09BC \u0993 \u09B9\u09B0\u09AA\u09CD\u09AA\u09BE \u09B8\u09AD\u09CD\u09AF\u09A4\u09BE)", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u092D\u093E\u0930\u0924\u0940\u092F \u0909\u092A\u092E\u0939\u093E\u0926\u094D\u0935\u0940\u092A \u0915\u0940 \u092A\u094D\u0930\u093E\u091A\u0940\u0928 \u0928\u0917\u0930\u0940\u092F \u0938\u092D\u094D\u092F\u0924\u093E (\u092E\u0947\u0939\u0930\u0917\u0922\u093C \u0914\u0930 \u0939\u0921\u093C\u092A\u094D\u092A\u093E \u0938\u092D\u094D\u092F\u0924\u093E)", ["Discovery of Harappa (Dayaram Sahni, 1921) & Mohenjo-daro (Rakhaldas Bandyopadhyay, 1922)", "Citadel, Great Bath, Granary, Lothal dockyard, drainage, seals, decline"], TB_HIST_6),
        ch("h6_c4", 4, "Ch 4: Early Phase of State Formation in the Indian Subcontinent (Vedic Age & Janapadas)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09AD\u09BE\u09B0\u09A4\u09C0\u09AF\u09BC \u0989\u09AA\u09AE\u09B9\u09BE\u09A6\u09C7\u09B6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u099A\u09C0\u09A8 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8\u09C7\u09B0 \u09A7\u09BE\u09B0\u09BE (\u09AC\u09C8\u09A6\u09BF\u0995 \u09B8\u09AD\u09CD\u09AF\u09A4\u09BE)", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u092A\u094D\u0930\u093E\u091A\u0940\u0928 \u092D\u093E\u0930\u0924\u0940\u092F \u0907\u0924\u093F\u0939\u093E\u0938 \u0915\u0940 \u0927\u093E\u0930\u093E (\u0935\u0948\u0926\u093F\u0915 \u0938\u092D\u094D\u092F\u0924\u093E)", ["Rigveda, Samaveda, Yajurveda, Atharvaveda", "Sabha & Samiti, Four Ashramas, Varna system", "Megalithic culture"], TB_HIST_6),
        ch("h6_c5", 5, "Ch 5: c. 6th Century BCE Indian Subcontinent \u2014 Janapadas, Mahajanapadas & New Religions", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u0996\u09CD\u09B0\u09BF\u09B8\u09CD\u099F\u09AA\u09C2\u09B0\u09CD\u09AC \u09B7\u09B7\u09CD\u09A0 \u09B6\u09A4\u0995\u09C7\u09B0 \u09AD\u09BE\u09B0\u09A4\u09C0\u09AF\u09BC \u0989\u09AA\u09AE\u09B9\u09BE\u09A6\u09C7\u09B6 (\u099C\u09A8\u09AA\u09A6, \u09AE\u09B9\u09BE\u099C\u09A8\u09AA\u09A6 \u0993 \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09BE\u09A6\u09C0 \u09A7\u09B0\u09CD\u09AE\u09C0\u09AF\u09BC \u0986\u09A8\u09CD\u09A6\u09CB\u09B2\u09A8)", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u091B\u0920\u0940 \u0936\u0924\u093E\u092C\u094D\u0926\u0940 \u0908\u0938\u093E \u092A\u0942\u0930\u094D\u0935 \u0915\u093E \u092D\u093E\u0930\u0924\u0940\u092F \u0909\u092A\u092E\u0939\u093E\u0926\u094D\u0935\u0940\u092A (\u092E\u0939\u093E\u091C\u0928\u092A\u0926, \u091C\u0948\u0928 \u0914\u0930 \u092C\u094C\u0926\u094D\u0927 \u0927\u0930\u094D\u092E)", ["16 Mahajanapadas & rise of Magadha", "Gana-sanghas (Vajji)", "Vardhamana Mahavira (Jainism, Triratna) & Gautama Buddha (Four Noble Truths, Eightfold Path, Tripitaka)"], TB_HIST_6),
        ch("h6_c6", 6, "Ch 6: Expansion of Empire \u2014 Mauryas, Kushanas, Satavahanas, Guptas & Harshavardhana", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09B8\u09BE\u09AE\u09CD\u09B0\u09BE\u099C\u09CD\u09AF \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0 \u0993 \u09B6\u09BE\u09B8\u09A8 (\u09AE\u09CC\u09B0\u09CD\u09AF, \u0995\u09C1\u09B7\u09BE\u09A3, \u09B8\u09BE\u09A4\u09AC\u09BE\u09B9\u09A8, \u0997\u09C1\u09AA\u09CD\u09A4 \u0993 \u09B9\u09B0\u09CD\u09B7\u09AC\u09B0\u09CD\u09A7\u09A8)", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u0938\u093E\u092E\u094D\u0930\u093E\u091C\u094D\u092F \u0935\u093F\u0938\u094D\u0924\u093E\u0930 \u0914\u0930 \u0936\u093E\u0938\u0928 (\u092E\u094C\u0930\u094D\u092F, \u0915\u0941\u0937\u093E\u0923, \u0938\u093E\u0924\u0935\u093E\u0939\u0928, \u0917\u0941\u092A\u094D\u0924 \u0914\u0930 \u0939\u0930\u094D\u0937\u0935\u0930\u094D\u0927\u0928)", ["Chandragupta Maurya, Kautilya Arthashastra, Ashoka & Kalinga War, Dhamma", "Kanishka, Gautamiputra Satakarni", "Samudragupta (Allahabad Pillar), Chandragupta II, Shashanka of Gauda, Harshavardhana"], TB_HIST_6),
        ch("h6_c7", 7, "Ch 7: Economy and Public Life (Ancient Agriculture, Crafts, Guilds & Trade Routes)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u0985\u09B0\u09CD\u09A5\u09A8\u09C0\u09A4\u09BF \u0993 \u099C\u09A8\u099C\u09C0\u09AC\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u0905\u0930\u094D\u0925\u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E \u0914\u0930 \u091C\u0928\u091C\u0940\u0935\u0928", ["Sudarshana Lake irrigation, Agrahara land grants", "Shreni/Guilds, Uttarapatha & Dakshinapatha, Indo-Roman trade", "Fa-Hien and Hiuen Tsang (Xuanzang) accounts"], TB_HIST_6),
        ch("h6_c8", 8, "Ch 8: Ancient Indian Culture \u2014 Literature, Science, Art & Architecture", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09AA\u09CD\u09B0\u09BE\u099A\u09C0\u09A8 \u09AD\u09BE\u09B0\u09A4\u09C0\u09AF\u09BC \u0989\u09AA\u09AE\u09B9\u09BE\u09A6\u09C7\u09B6\u09C7\u09B0 \u09B8\u0982\u09B8\u09CD\u0995\u09C3\u09A4\u09BF \u099A\u09B0\u09CD\u099A\u09BE\u09B0 \u09A8\u09BE\u09A8\u09BE \u09A6\u09BF\u0995", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u092A\u094D\u0930\u093E\u091A\u0940\u0928 \u092D\u093E\u0930\u0924\u0940\u092F \u0909\u092A\u092E\u0939\u093E\u0926\u094D\u0935\u0940\u092A \u092E\u0947\u0902 \u0938\u0902\u0938\u094D\u0915\u0943\u0924\u093F, \u0938\u093E\u0939\u093F\u0924\u094D\u092F, \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0914\u0930 \u0938\u094D\u0925\u093E\u092A\u0924\u094D\u092F", ["Nalanda, Taxila, Vikramashila universities", "Kalidasa, Shudraka, Banabhatta, Sangam literature", "Aryabhatta, Varahamihira, Charaka, Sushruta", "Gandhara & Mathura art, Sanchi Stupa, Ajanta cave paintings"], TB_HIST_6),
        ch("h6_c9", 9, "Ch 9: India and the Contemporary World (Cultural & Commercial Contacts)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u09AD\u09BE\u09B0\u09A4 \u0993 \u09B8\u09AE\u0995\u09BE\u09B2\u09C0\u09A8 \u09AC\u09B9\u09BF\u09B0\u09CD\u09AC\u09BF\u09B6\u09CD\u09AC", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u092D\u093E\u0930\u0924 \u0914\u0930 \u0938\u092E\u0915\u093E\u0932\u0940\u0928 \u092C\u093E\u0939\u094D\u092F \u0935\u093F\u0936\u094D\u0935", ["Persian & Alexander invasions", "Silk Route & Kushana trade", "Spread of Buddhism to Sri Lanka, Central Asia, China, and Southeast Asia"], TB_HIST_6)
      ]
    },
    7: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_HIST_7,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Atit o Aitihya Class VII (Chapters 1\u20139)",
      boardNote: {
        en: "Official WBBSE Class VII Atit o Aitihya (History) \u2014 All 9 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0985\u09A4\u09C0\u09A4 \u0993 \u0990\u09A4\u09BF\u09B9\u09CD\u09AF (\u0987\u09A4\u09BF\u09B9\u09BE\u09B8) \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09EF\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 7 \u0905\u0924\u0940\u0924 \u0913 \u0910\u0924\u093F\u0939\u094D\u092F (\u0907\u0924\u093F\u0939\u093E\u0938) \u2014 \u0938\u092D\u0940 9 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("h7_c1", 1, "Ch 1: Introductory Concept of History", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u0987\u09A4\u09BF\u09B9\u09BE\u09B8\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u0907\u0924\u093F\u0939\u093E\u0938 \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Chronology and transition from Ancient to Early Medieval India"], TB_HIST_7),
        ch("h7_c2", 2, "Ch 2: Several Aspects of Political History of India (c. 7th\u201312th Century CE)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09AD\u09BE\u09B0\u09A4\u09C7\u09B0 \u09B0\u09BE\u099C\u09A8\u09C8\u09A4\u09BF\u0995 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8\u09C7\u09B0 \u0995\u09AF\u09BC\u09C7\u0995\u099F\u09BF \u09A7\u09BE\u09B0\u09BE (\u0996\u09CD\u09B0\u09BF\u09B8\u09CD\u099F\u09C0\u09AF\u09BC \u09B8\u09AA\u09CD\u09A4\u09AE \u09A5\u09C7\u0995\u09C7 \u09A6\u09CD\u09AC\u09BE\u09A6\u09B6 \u09B6\u09A4\u0995)", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u092D\u093E\u0930\u0924 \u0915\u0947 \u0930\u093E\u091C\u0928\u0940\u0924\u093F\u0915 \u0907\u0924\u093F\u0939\u093E\u0938 \u0915\u0940 \u0915\u0941\u091B \u0927\u093E\u0930\u093E\u090F\u0901 (7\u0935\u0940\u0902 \u0938\u0947 12\u0935\u0940\u0902 \u0936\u0924\u093E\u092C\u094D\u0926\u0940 \u0908\u0938\u094D\u0935\u0940)", ["Shashanka of Gauda, Matsyanyaya, Pala dynasty (Gopala, Dharmapala, Devapala, Ramapala & Kaivarta rebellion)", "Sena dynasty (Vijayasena, Ballalasena, Lakshmanasena)", "Tripartite struggle for Kannauj (Palas, Gurjara-Pratiharas, Rashtrakutas)", "Chola administration (Rajaraja I, Rajendra Chola I, Ur & Nadu), Mahmud of Ghazni & Muhammad Ghori"], TB_HIST_7),
        ch("h7_c3", 3, "Ch 3: Some Aspects of Society, Economy and Culture of India (c. 7th\u201312th Century CE)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AD\u09BE\u09B0\u09A4\u09C7\u09B0 \u09B8\u09AE\u09BE\u099C, \u0985\u09B0\u09CD\u09A5\u09A8\u09C0\u09A4\u09BF \u0993 \u09B8\u0982\u09B8\u09CD\u0995\u09C3\u09A4\u09BF\u09B0 \u0995\u09AF\u09BC\u09C7\u0995\u099F\u09BF \u09A7\u09BE\u09B0\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u092D\u093E\u0930\u0924 \u0915\u0947 \u0938\u092E\u093E\u091C, \u0905\u0930\u094D\u0925\u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E \u0914\u0930 \u0938\u0902\u0938\u094D\u0915\u0943\u0924\u093F \u0915\u0947 \u0915\u0941\u091B \u092A\u0939\u0932\u0942 (7\u0935\u0940\u0902\u201312\u0935\u0940\u0902 \u0936\u0924\u093E\u092C\u094D\u0926\u0940)", ["Feudalism (Samanta system)", "Vikramashila & Nalanda, Dipankara Srijnana (Atisha)", "Jayadeva (Gitagovinda), Sandhyakar Nandi (Ramacharitam), Chakrapani Datta, Charyapada", "Angkor Wat & Borobudur"], TB_HIST_7),
        ch("h7_c4", 4, "Ch 4: The Delhi Sultanate (Turko-Afghan Rule: 1206\u20131526 CE)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09A6\u09BF\u09B2\u09CD\u09B2\u09BF \u09B8\u09C1\u09B2\u09A4\u09BE\u09A8\u09BF (\u09A4\u09C1\u09B0\u09CD\u0995\u09BF-\u0986\u09AB\u0997\u09BE\u09A8 \u09B6\u09BE\u09B8\u09A8)", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u0926\u093F\u0932\u094D\u0932\u0940 \u0938\u0932\u094D\u0924\u0928\u0924 (\u0924\u0941\u0930\u094D\u0915-\u0905\u092B\u093C\u0917\u093E\u0928 \u0936\u093E\u0938\u0928: 1206\u20131526 \u0908.)", ["Mamluk/Ilbari dynasty (Qutbuddin Aibak, Iltutmish, Razia, Balban)", "Khalji dynasty (Alauddin Khalji market reforms), Tughlaq dynasty (Muhammad bin Tughlaq, Firuz Shah), Sayyid & Lodi", "Iqta system, Kharaj, Jizya, Ilyas Shahi & Husain Shahi dynasties in Bengal, Vijayanagara & Bahmani kingdoms"], TB_HIST_7),
        ch("h7_c5", 5, "Ch 5: The Mughal Empire (1526\u20131707 CE)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AE\u09C1\u0998\u09B2 \u09B8\u09BE\u09AE\u09CD\u09B0\u09BE\u099C\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u092E\u0941\u0917\u093C\u0932 \u0938\u093E\u092E\u094D\u0930\u093E\u091C\u094D\u092F", ["Babur (First Battle of Panipat, 1526; Khanwa), Humayun & Sher Shah Suri (Sarai, Sadak-i-Azam, Patta & Qabuliyat)", "Akbar (Second Battle of Panipat, Haldighati, Baro Bhuiyans of Bengal, Mansabdari & Jagirdari, Zabti/Todar Mal, Sulh-i-Kul)", "Jahangir, Shah Jahan, Aurangzeb"], TB_HIST_7),
        ch("h7_c6", 6, "Ch 6: Towns, Traders and Trade in Medieval India", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09A8\u0997\u09B0, \u09AC\u09A3\u09BF\u0995 \u0993 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u0928\u0917\u0930, \u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940 \u0914\u0930 \u0935\u094D\u092F\u093E\u092A\u093E\u0930", ["Urbanization in Delhi, Agra, Fatehpur Sikri, Hampi, Surat, Masulipatnam, Saptagram, Hooghly", "Banjara traders, Hundi (bills of exchange), arrival of Portuguese, Dutch, English & French traders"], TB_HIST_7),
        ch("h7_c7", 7, "Ch 7: Lifestyle and Culture (Bhakti, Sufi, Architecture, Painting & Music)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u099C\u09C0\u09AC\u09A8\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE \u0993 \u09B8\u0982\u09B8\u09CD\u0995\u09C3\u09A4\u09BF (\u09B8\u09C1\u09B2\u09A4\u09BE\u09A8\u09BF \u0993 \u09AE\u09C1\u0998\u09B2 \u09AF\u09C1\u0997)", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u091C\u0940\u0935\u0928\u0936\u0948\u0932\u0940 \u0914\u0930 \u0938\u0902\u0938\u094D\u0915\u0943\u0924\u093F (\u092D\u0915\u094D\u0924\u093F, \u0938\u0942\u092B\u093C\u0940, \u0938\u094D\u0925\u093E\u092A\u0924\u094D\u092F, \u091A\u093F\u0924\u094D\u0930\u0915\u0932\u093E \u0914\u0930 \u0938\u0902\u0917\u0940\u0924)", ["Bhakti movement: Kabir, Guru Nanak, Mirabai, Sri Chaitanya Mahaprabhu", "Sufi Chishti & Suhrawardi orders (Moinuddin Chishti, Nizamuddin Auliya)", "Indo-Islamic & Mughal architecture (Qutb Minar, Taj Mahal, Red Fort), Bengal terracotta temples (Bishnupur), Persian translations & Dara Shikoh"], TB_HIST_7),
        ch("h7_c8", 8, "Ch 8: Crisis of the Mughal Empire (Marathas, Sikhs, Jats & Regional Powers)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09AE\u09C1\u0998\u09B2 \u09B8\u09BE\u09AE\u09CD\u09B0\u09BE\u099C\u09CD\u09AF\u09C7\u09B0 \u09B8\u0982\u0995\u099F", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u092E\u0941\u0917\u093C\u0932 \u0938\u093E\u092E\u094D\u0930\u093E\u091C\u094D\u092F \u0915\u093E \u0938\u0902\u0915\u091F", ["Jagirdari crisis", "Chhatrapati Shivaji Maharaj (Ashtapradhan, Chauth & Sardeshmukhi)", "Sikh Gurus & Khalsa (Guru Gobind Singh), Satnami & Jat revolts"], TB_HIST_7),
        ch("h7_c9", 9, "Ch 9: India Today \u2014 Government, Democracy, Constitution & Local Self-Government", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u0986\u099C\u0995\u09C7\u09B0 \u09AD\u09BE\u09B0\u09A4 (\u09B8\u09B0\u0995\u09BE\u09B0, \u0997\u09A3\u09A4\u09A8\u09CD\u09A4\u09CD\u09B0 \u0993 \u09B8\u09CD\u09AC\u09BE\u09AF\u09BC\u09A4\u09CD\u09A4\u09B6\u09BE\u09B8\u09A8)", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u0906\u091C \u0915\u093E \u092D\u093E\u0930\u0924 (\u0938\u0930\u0915\u093E\u0930, \u0932\u094B\u0915\u0924\u0902\u0924\u094D\u0930, \u0938\u0902\u0935\u093F\u0927\u093E\u0928 \u0914\u0930 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0938\u094D\u0935\u0936\u093E\u0938\u0928)", ["Indian Constitution (26 Nov 1949 / 26 Jan 1950)", "Sovereign, Socialist, Secular, Democratic Republic", "Separation of powers (Legislature, Executive, Judiciary), Three-tier Panchayati Raj & Municipalities"], TB_HIST_7)
      ]
    },
    8: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_HIST_8,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Atit o Aitihya Class VIII (Chapters 1\u20139)",
      boardNote: {
        en: "Official WBBSE Class VIII Atit o Aitihya (History) \u2014 All 9 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0985\u09A4\u09C0\u09A4 \u0993 \u0990\u09A4\u09BF\u09B9\u09CD\u09AF (\u0987\u09A4\u09BF\u09B9\u09BE\u09B8) \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09EF\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 8 \u0905\u0924\u0940\u0924 \u0913 \u0910\u0924\u093F\u0939\u094D\u092F (\u0907\u0924\u093F\u0939\u093E\u0938) \u2014 \u0938\u092D\u0940 9 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("h8_c1", 1, "Ch 1: Concept of Modern History", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u0987\u09A4\u09BF\u09B9\u09BE\u09B8\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE (\u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u09AD\u09BE\u09B0\u09A4\u09C7\u09B0 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8)", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u0906\u0927\u0941\u0928\u093F\u0915 \u0907\u0924\u093F\u0939\u093E\u0938 \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["Periodization of Indian history (James Mill vs modern historians)", "Primary and archival sources of modern India"], TB_HIST_8),
        ch("h8_c2", 2, "Ch 2: Rise of Regional Powers (Bengal, Awadh, Hyderabad, Mysore & Marathas; Plassey & Buxar)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u0986\u099E\u09CD\u099A\u09B2\u09BF\u0995 \u09B6\u0995\u09CD\u09A4\u09BF\u09B0 \u0989\u09A4\u09CD\u09A5\u09BE\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u0936\u0915\u094D\u0924\u093F\u092F\u094B\u0902 \u0915\u093E \u0909\u0926\u092F (\u092C\u0902\u0917\u093E\u0932, \u0905\u0935\u0927, \u0939\u0948\u0926\u0930\u093E\u092C\u093E\u0926, \u092E\u0948\u0938\u0942\u0930, \u092A\u094D\u0932\u093E\u0938\u0940 \u0914\u0930 \u092C\u0915\u094D\u0938\u0930)", ["Murshid Quli Khan, Alivardi Khan, Siraj-ud-Daulah", "Farrukhsiyar Farman (1717), Battle of Plassey (1757), Mir Jafar & Mir Qasim", "Battle of Buxar (1764), Grant of Diwani (1765), Dual Government & Famine of 1770 (Chhiyattarer Manvantar)", "Subsidiary Alliance (Wellesley) & Doctrine of Lapse (Dalhousie)"], TB_HIST_8),
        ch("h8_c3", 3, "Ch 3: Establishment of Colonial Authority (Civil Service, Police, Army, Judiciary & Education)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u0994\u09AA\u09A8\u09BF\u09AC\u09C7\u09B6\u09BF\u0995 \u0995\u09B0\u09CD\u09A4\u09C3\u09A4\u09CD\u09AC \u09AA\u09CD\u09B0\u09A4\u09BF\u09B7\u09CD\u09A0\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u0914\u092A\u0928\u093F\u0935\u0947\u0936\u093F\u0915 \u0938\u0924\u094D\u0924\u093E \u0915\u0940 \u0938\u094D\u0925\u093E\u092A\u0928\u093E", ["Regulating Act (1773), Pitt India Act (1784), Charter Acts (1813, 1833)", "Cornwallis Code, Fort William College (1800)", "Asiatic Society (William Jones, 1784), Macaulay Minute (1835), Wood Despatch (1854)"], TB_HIST_8),
        ch("h8_c4", 4, "Ch 4: Character of Colonial Economy (Land Revenue, Commercialization, Deindustrialization, Railways & Drain of Wealth)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u0994\u09AA\u09A8\u09BF\u09AC\u09C7\u09B6\u09BF\u0995 \u0985\u09B0\u09CD\u09A5\u09A8\u09C0\u09A4\u09BF\u09B0 \u099A\u09B0\u09BF\u09A4\u09CD\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u0914\u092A\u0928\u093F\u0935\u0947\u0936\u093F\u0915 \u0905\u0930\u094D\u0925\u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E \u0915\u093E \u091A\u0930\u093F\u0924\u094D\u0930", ["Permanent Settlement (1793), Ryotwari, Mahalwari systems", "Deindustrialization of Indian textiles", "Introduction of Railways (1853) & Telegraph", "Dadabhai Naoroji Drain of Wealth theory"], TB_HIST_8),
        ch("h8_c5", 5, "Ch 5: Reactions to Colonial Rule \u2014 Social Reform & The Great Revolt of 1857", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u0994\u09AA\u09A8\u09BF\u09AC\u09C7\u09B6\u09BF\u0995 \u09B6\u09BE\u09B8\u09A8\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE: \u09B8\u09B9\u09AF\u09CB\u0997\u09BF\u09A4\u09BE \u0993 \u09AC\u09BF\u09A6\u09CD\u09B0\u09CB\u09B9", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u0914\u092A\u0928\u093F\u0935\u0947\u0936\u093F\u0915 \u0936\u093E\u0938\u0928 \u0915\u0940 \u092A\u094D\u0930\u0924\u093F\u0915\u094D\u0930\u093F\u092F\u093E: \u0938\u092E\u093E\u091C \u0938\u0941\u0927\u093E\u0930 \u0914\u0930 1857 \u0915\u093E \u092E\u0939\u093E\u0935\u093F\u0926\u094D\u0930\u094B\u0939", ["Raja Rammohan Roy (Abolition of Sati, 1829), Vidyasagar (Widow Remarriage Act, 1856), Young Bengal (Derozio), Swami Vivekananda, Aligarh Movement (Sir Syed Ahmad Khan)", "Santhal Hul (1855), Munda Ulgulan, Indigo Revolt (1859)", "Great Revolt of 1857 (Mangal Pandey, Bahadur Shah Zafar, Rani Lakshmibai, Nana Saheb, Kunwar Singh) & Queen Victoria Proclamation (1858)"], TB_HIST_8),
        ch("h8_c6", 6, "Ch 6: Initial Phase of Nationalism (Early Associations, INC, Swadeshi & Revolutionary Movement)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u099C\u09BE\u09A4\u09C0\u09AF\u09BC\u09A4\u09BE\u09AC\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09AC\u09BF\u0995\u09BE\u09B6", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0935\u093E\u0926 \u0915\u093E \u092A\u094D\u0930\u093E\u0930\u0902\u092D\u093F\u0915 \u0935\u093F\u0915\u093E\u0938 (\u0915\u093E\u0902\u0917\u094D\u0930\u0947\u0938 \u0915\u0940 \u0938\u094D\u0925\u093E\u092A\u0928\u093E \u0914\u0930 \u0938\u094D\u0935\u0926\u0947\u0936\u0940 \u0906\u0902\u0926\u094B\u0932\u0928)", ["Indian Association (Surendranath Banerjea, 1876), Ilbert Bill controversy, Founding of INC (1885, Hume & W.C. Bonnerjee)", "Moderates vs Extremists (Lal-Bal-Pal, Aurobindo Ghosh)", "Partition of Bengal (1905) & Swadeshi-Boycott Movement, Anushilan Samiti & Jugantar"], TB_HIST_8),
        ch("h8_c7", 7, "Ch 7: Character and Practices of Indian National Movement (Gandhian Era, Subhas Chandra Bose & INA)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09AD\u09BE\u09B0\u09A4\u09C7\u09B0 \u099C\u09BE\u09A4\u09C0\u09AF\u09BC \u0986\u09A8\u09CD\u09A6\u09CB\u09B2\u09A8\u09C7\u09B0 \u0986\u09A6\u09B0\u09CD\u09B6 \u0993 \u09AC\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u092D\u093E\u0930\u0924\u0940\u092F \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u0906\u0902\u0926\u094B\u0932\u0928 \u0915\u0947 \u0906\u0926\u0930\u094D\u0936 \u0914\u0930 \u0935\u093F\u0915\u093E\u0938 (\u0917\u093E\u0902\u0927\u0940\u0935\u093E\u0926\u0940 \u092F\u0941\u0917 \u0914\u0930 \u0906\u091C\u093C\u093E\u0926 \u0939\u093F\u0902\u0926 \u092B\u093C\u094C\u091C)", ["Champaran, Kheda, Ahmedabad satyagrahas, Rowlatt Act & Jallianwala Bagh (1919)", "Khilafat & Non-Cooperation Movement (1920\u201322), Civil Disobedience & Dandi March (1930), Quit India Movement (1942)", "Bhagat Singh (HSRA), Surya Sen (Chittagong Armoury Raid, 1930), Netaji Subhas Chandra Bose & Azad Hind Fauj (INA), RIN Mutiny (1946)"], TB_HIST_8),
        ch("h8_c8", 8, "Ch 8: From Communalism to Partition (Two-Nation Theory, 1947 Independence & Refugee Crisis)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09B8\u09BE\u09AE\u09CD\u09AA\u09CD\u09B0\u09A6\u09BE\u09AF\u09BC\u09BF\u0995\u09A4\u09BE \u09A5\u09C7\u0995\u09C7 \u09A6\u09C7\u09B6\u09AD\u09BE\u0997", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u0938\u093E\u0902\u092A\u094D\u0930\u0926\u093E\u092F\u093F\u0915\u0924\u093E \u0938\u0947 \u0926\u0947\u0936 \u0915\u0947 \u0935\u093F\u092D\u093E\u091C\u0928 \u0924\u0915", ["Muslim League (1906), Lucknow Pact (1916), Lahore Resolution (1940)", "Cripps Mission, Cabinet Mission (1946), Mountbatten Plan & Indian Independence Act (1947)"], TB_HIST_8),
        ch("h8_c9", 9, "Ch 9: Indian Constitution \u2014 Democracy, Fundamental Rights, Directive Principles & Citizen Duties", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u09AD\u09BE\u09B0\u09A4\u09C0\u09AF\u09BC \u09B8\u0982\u09AC\u09BF\u09A7\u09BE\u09A8: \u0997\u09A3\u09A4\u09A8\u09CD\u09A4\u09CD\u09B0\u09C7\u09B0 \u0995\u09BE\u09A0\u09BE\u09AE\u09CB \u0993 \u099C\u09A8\u0997\u09A3\u09C7\u09B0 \u0985\u09A7\u09BF\u0995\u09BE\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u092D\u093E\u0930\u0924\u0940\u092F \u0938\u0902\u0935\u093F\u0927\u093E\u0928: \u0932\u094B\u0915\u0924\u0902\u0924\u094D\u0930 \u0915\u093E \u0922\u093E\u0901\u091A\u093E \u0914\u0930 \u0928\u093E\u0917\u0930\u093F\u0915\u094B\u0902 \u0915\u0947 \u0905\u0927\u093F\u0915\u093E\u0930", ["Constituent Assembly (Dr. Rajendra Prasad, Dr. B.R. Ambedkar)", "Parliamentary system, President, Prime Minister, Chief Minister", "Fundamental Rights (Articles 14\u201332), Directive Principles of State Policy, Fundamental Duties"], TB_HIST_8)
      ]
    },
    9: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_HIST_9,
      syllabusVersion: "WBBSE Secondary Curriculum (Current Edition)",
      officialSource: "WBBSE \u2014 Itihas o Paribesh Class IX (Chapters 1\u20137)",
      boardNote: {
        en: "Official WBBSE Class IX Itihas o Paribesh (European & World History) \u2014 All 7 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09ED\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 9 \u0907\u0924\u093F\u0939\u093E\u0938 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 (\u092F\u0942\u0930\u094B\u092A\u0940\u092F \u090F\u0935\u0902 \u0935\u093F\u0936\u094D\u0935 \u0907\u0924\u093F\u0939\u093E\u0938) \u2014 \u0938\u092D\u0940 7 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("h9_c1", 1, "Ch 1: Some Aspects of the French Revolution (1789)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AB\u09B0\u09BE\u09B8\u09BF \u09AC\u09BF\u09AA\u09CD\u09B2\u09AC\u09C7\u09B0 \u0995\u09AF\u09BC\u09C7\u0995\u099F\u09BF \u09A6\u09BF\u0995", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092B\u093C\u094D\u0930\u093E\u0902\u0938\u0940\u0938\u0940 \u0915\u094D\u0930\u093E\u0902\u0924\u093F \u0915\u0947 \u0915\u0941\u091B \u092A\u0939\u0932\u0942 (1789)", ["Ancien R\xE9gime, Three Estates, Bourgeoisie", "Montesquieu, Voltaire, Rousseau, Physiocrats", "Tennis Court Oath, Fall of Bastille (14 July 1789), Declaration of Rights of Man and Citizen, Reign of Terror (Robespierre)"], TB_HIST_9),
        ch("h9_c2", 2, "Ch 2: Revolutionary Ideals, Napoleonic Empire and the Idea of Nationalism", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09AC\u09BF\u09AA\u09CD\u09B2\u09AC\u09C0 \u0986\u09A6\u09B0\u09CD\u09B6, \u09A8\u09C7\u09AA\u09CB\u09B2\u09BF\u09AF\u09BC\u09A8\u09C0\u09AF\u09BC \u09B8\u09BE\u09AE\u09CD\u09B0\u09BE\u099C\u09CD\u09AF \u0993 \u099C\u09BE\u09A4\u09C0\u09AF\u09BC\u09A4\u09BE\u09AC\u09BE\u09A6", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u0915\u094D\u0930\u093E\u0902\u0924\u093F\u0915\u093E\u0930\u0940 \u0906\u0926\u0930\u094D\u0936, \u0928\u0947\u092A\u094B\u0932\u093F\u092F\u0928 \u0915\u093E \u0938\u093E\u092E\u094D\u0930\u093E\u091C\u094D\u092F \u0914\u0930 \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0935\u093E\u0926", ["Code Napol\xE9on (1804), Confederation of the Rhine", "Continental System, Peninsular War, Moscow Campaign (1812), Battle of Nations (Leipzig, 1813), Battle of Waterloo (1815)"], TB_HIST_9),
        ch("h9_c3", 3, "Ch 3: Europe in the 19th Century \u2014 Conflict of Monarchical and Nationalist Ideas", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u0989\u09A8\u09AC\u09BF\u0982\u09B6 \u09B6\u09A4\u0995\u09C7\u09B0 \u0987\u0989\u09B0\u09CB\u09AA: \u09B0\u09BE\u099C\u09A4\u09BE\u09A8\u09CD\u09A4\u09CD\u09B0\u09BF\u0995 \u0993 \u099C\u09BE\u09A4\u09C0\u09AF\u09BC\u09A4\u09BE\u09AC\u09BE\u09A6\u09C0 \u09AD\u09BE\u09AC\u09A7\u09BE\u09B0\u09BE\u09B0 \u09B8\u0982\u0998\u09BE\u09A4", "\u0905\u0927\u094D\u092F\u093E\u092F 3: 19\u0935\u0940\u0902 \u0936\u0924\u093E\u092C\u094D\u0926\u0940 \u0915\u093E \u092F\u0942\u0930\u094B\u092A: \u0930\u093E\u091C\u0924\u0902\u0924\u094D\u0930\u0940\u092F \u0914\u0930 \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0935\u093E\u0926\u0940 \u0935\u093F\u091A\u093E\u0930\u094B\u0902 \u0915\u093E \u0938\u0902\u0918\u0930\u094D\u0937", ["Vienna Congress (1815, Metternich System, Legitimacy, Balance of Power)", "July Revolution (1830) & February Revolution (1848)", "Unification of Italy (Mazzini, Young Italy, Cavour, Garibaldi) & Unification of Germany (Zollverein, Bismarck Blood and Iron policy, 1871)", "Emancipation of Serfs in Russia (Tsar Alexander II, 1861), Balkan nationalism & Crimean War"], TB_HIST_9),
        ch("h9_c4", 4, "Ch 4: Industrial Revolution, Colonialism and Imperialism", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09B6\u09BF\u09B2\u09CD\u09AA\u09AC\u09BF\u09AA\u09CD\u09B2\u09AC, \u0989\u09AA\u09A8\u09BF\u09AC\u09C7\u09B6\u09AC\u09BE\u09A6 \u0993 \u09B8\u09BE\u09AE\u09CD\u09B0\u09BE\u099C\u09CD\u09AF\u09AC\u09BE\u09A6", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u0914\u0926\u094D\u092F\u094B\u0917\u093F\u0915 \u0915\u094D\u0930\u093E\u0902\u0924\u093F, \u0909\u092A\u0928\u093F\u0935\u0947\u0936\u0935\u093E\u0926 \u0914\u0930 \u0938\u093E\u092E\u094D\u0930\u093E\u091C\u094D\u092F\u0935\u093E\u0926", ["Why Industrial Revolution began in England first, factory system & Ghetto", "Utopian and Scientific Socialism (Saint-Simon, Robert Owen, Karl Marx & Friedrich Engels, Communist Manifesto 1848)", "Scramble for Africa, Partition of China, Triple Alliance (1882) & Triple Entente (1907), Sarajevo assassination & outbreak of WWI (1914)"], TB_HIST_9),
        ch("h9_c5", 5, "Ch 5: Europe in the 20th Century (Russian Revolution, Treaty of Versailles, Fascism, Nazism & Great Depression)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AC\u09BF\u0982\u09B6 \u09B6\u09A4\u0995\u09C7 \u0987\u0989\u09B0\u09CB\u09AA", "\u0905\u0927\u094D\u092F\u093E\u092F 5: 20\u0935\u0940\u0902 \u0936\u0924\u093E\u092C\u094D\u0926\u0940 \u092E\u0947\u0902 \u092F\u0942\u0930\u094B\u092A (\u0930\u0942\u0938\u0940 \u0915\u094D\u0930\u093E\u0902\u0924\u093F, \u0935\u0930\u094D\u0938\u093E\u092F \u0915\u0940 \u0938\u0902\u0927\u093F, \u092B\u093E\u0938\u0940\u0935\u093E\u0926 \u0914\u0930 \u0928\u093E\u091C\u093C\u0940\u0935\u093E\u0926)", ["1905 Bloody Sunday, March & November 1917 Bolshevik Revolution (Lenin, April Theses, NEP)", "Woodrow Wilson 14 Points, Treaty of Versailles (1919), League of Nations", "Great Depression (1929), Rise of Fascism in Italy (Mussolini) & Nazism in Germany (Hitler), Spanish Civil War (Guernica)"], TB_HIST_9),
        ch("h9_c6", 6, "Ch 6: The Second World War and Its Aftermath (1939\u20131945)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09A6\u09CD\u09AC\u09BF\u09A4\u09C0\u09AF\u09BC \u09AC\u09BF\u09B6\u09CD\u09AC\u09AF\u09C1\u09A6\u09CD\u09A7 \u098F\u09AC\u0982 \u09A4\u09BE\u09B0 \u09AA\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0 \u09AA\u09B0\u09CD\u09AF\u09BE\u09AF\u09BC", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u0926\u094D\u0935\u093F\u0924\u0940\u092F \u0935\u093F\u0936\u094D\u0935 \u092F\u0941\u0926\u094D\u0927 \u0914\u0930 \u0909\u0938\u0915\u0947 \u092A\u0930\u093F\u0923\u093E\u092E (1939\u20131945)", ["Policy of Appeasement, Munich Pact (1938), Rome-Berlin-Tokyo Axis, Invasion of Poland (1 Sept 1939)", "Operation Barbarossa, Pearl Harbor (7 Dec 1941), Battle of Stalingrad, D-Day (Normandy), Hiroshima & Nagasaki", "Impact of WWII and decolonization"], TB_HIST_9),
        ch("h9_c7", 7, "Ch 7: League of Nations and the United Nations Organization (UNO)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u099C\u09BE\u09A4\u09BF\u09B8\u0982\u0998 \u098F\u09AC\u0982 \u09B8\u09AE\u09CD\u09AE\u09BF\u09B2\u09BF\u09A4 \u099C\u09BE\u09A4\u09BF\u09AA\u09C1\u099E\u09CD\u099C", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u0930\u093E\u0937\u094D\u091F\u094D\u0930 \u0938\u0902\u0918 \u0914\u0930 \u0938\u0902\u092F\u0941\u0915\u094D\u0924 \u0930\u093E\u0937\u094D\u091F\u094D\u0930 \u0938\u0902\u0918 (UNO)", ["Atlantic Charter (1941), San Francisco Conference (1945), UN Charter (24 Oct 1945)", "6 Principal Organs of UNO: General Assembly, Security Council (5 Permanent Veto members), ECOSOC, Trusteeship Council, ICJ (The Hague), Secretariat"], TB_HIST_9)
      ]
    },
    10: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_HIST_10,
      syllabusVersion: "WBBSE Madhyamik Pariksha Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Itihas o Paribesh Class X (Chapters 1\u20138)",
      boardNote: {
        en: "Official WBBSE Class X Itihas o Paribesh (Madhyamik Pariksha) \u2014 All 8 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995) \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09EE\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 10 \u0907\u0924\u093F\u0939\u093E\u0938 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 (\u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E) \u2014 \u0938\u092D\u0940 8 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("h10_c1", 1, "Ch 1: Ideas of History (New Social History, Historiography & Sources)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u0987\u09A4\u09BF\u09B9\u09BE\u09B8\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u0907\u0924\u093F\u0939\u093E\u0938 \u0915\u0940 \u0905\u0935\u0927\u093E\u0930\u0923\u093E", ["New Social History, History of Sports, Food, Clothing, Performing Arts, Photography, Local, Urban, Military & Environmental History, Women History", "Autobiographies: Sattar Batsar (Bipin Chandra Pal), Jibansmriti (Rabindranath Tagore), Jibaner Jharapata (Sarala Devi Chaudhurani)", "Letters of Nehru to Indira, Periodicals: Bangadarshan (Bankimchandra) & Somprakash (Dwarakanath Vidyabhushan)"], TB_HIST_10),
        ch("h10_c2", 2, "Ch 2: Reform \u2014 Characteristics and Observations (19th Century Bengal Renaissance)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09B8\u0982\u09B8\u09CD\u0995\u09BE\u09B0: \u09AC\u09C8\u09B6\u09BF\u09B7\u09CD\u099F\u09CD\u09AF \u0993 \u09AA\u09B0\u09CD\u09AF\u09BE\u09B2\u09CB\u099A\u09A8\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u0938\u0941\u0927\u093E\u0930: \u0935\u093F\u0936\u0947\u0937\u0924\u093E\u090F\u0901 \u0914\u0930 \u0905\u0935\u0932\u094B\u0915\u0928 (19\u0935\u0940\u0902 \u0936\u0924\u093E\u092C\u094D\u0926\u0940 \u0915\u093E \u092C\u0902\u0917\u093E\u0932)", ["Bamabodhini Patrika, Hindoo Patriot (Harish Chandra Mukherjee), Hutom Pyanchar Naksha (Kaliprasanna Singha), Neel Darpan (Dinabandhu Mitra), Grambarta Prakashika (Kangal Harinath)", "Orientalist-Anglicist debate, Macaulay Minute (1835), Wood Despatch (1854), Calcutta Medical College (1835, Madhusudan Gupta), Calcutta University (1857)", "Brahmo Samaj divisions, Young Bengal, Vidyasagar, Sri Ramakrishna (Sarvadharma Samanwaya), Swami Vivekananda (Navavedanta), Lalon Fakir"], TB_HIST_10),
        ch("h10_c3", 3, "Ch 3: Resistance and Rebellion \u2014 Characteristics and Analyses", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AA\u09CD\u09B0\u09A4\u09BF\u09B0\u09CB\u09A7 \u0993 \u09AC\u09BF\u09A6\u09CD\u09B0\u09CB\u09B9: \u09AC\u09C8\u09B6\u09BF\u09B7\u09CD\u099F\u09CD\u09AF \u0993 \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u092A\u094D\u0930\u0924\u093F\u0930\u094B\u0927 \u0914\u0930 \u0935\u093F\u0926\u094D\u0930\u094B\u0939: \u0935\u093F\u0936\u0947\u0937\u0924\u093E\u090F\u0901 \u0914\u0930 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923", ["Colonial Forest Acts (1865, 1878) & Dietrich Brandis", "Chuar Rebellion, Kol Rebellion (1831\u201332), Santhal Hul (1855\u201356, Sidhu-Kanhu), Munda Ulgulan (1899\u20131900, Birsa Munda), Sannyasi-Fakir Rebellion, Wahabi (Titu Mir & Barasat Bamboo Fort) & Faraizi (Haji Shariatullah, Dudu Miyan) movements, Pagal Panthi", "Indigo Revolt (1859\u201360, Bishnucharan & Digambar Biswas) & Pabna Peasant Uprising"], TB_HIST_10),
        ch("h10_c4", 4, "Ch 4: Early Stages of Collective Action \u2014 Characteristics and Analyses", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09B8\u0982\u0998\u09AC\u09A6\u09CD\u09A7\u09A4\u09BE\u09B0 \u0997\u09CB\u09A1\u09BC\u09BE\u09B0 \u0995\u09A5\u09BE: \u09AC\u09C8\u09B6\u09BF\u09B7\u09CD\u099F\u09CD\u09AF \u0993 \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u0938\u093E\u092E\u0942\u0939\u093F\u0915 \u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908 \u0915\u0947 \u092A\u094D\u0930\u093E\u0930\u0902\u092D\u093F\u0915 \u091A\u0930\u0923: \u0935\u093F\u0936\u0947\u0937\u0924\u093E\u090F\u0901 \u0914\u0930 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923", ["1857 Revolt: nature (Marx, Savarkar, S.N. Sen, R.C. Majumdar) & Queen Proclamation (1858)", "Bangabhasha Prakashika Sabha (1836), Zamindari Association (1838), Hindu Mela (Nabagopal Mitra, 1867), Indian Association (Surendranath Banerjea, 1876)", "Vernacular Press Act (1878), Arms Act, Ilbert Bill (1883)", "Anandamath, Bharatbarsher Itihas, Bartaman Bharat, Gora, Bharat Mata painting (Abanindranath Tagore) & Gaganendranath Tagore cartoons"], TB_HIST_10),
        ch("h10_c5", 5, "Ch 5: Alternative Ideas and Initiatives (From Mid-19th Century to Early 20th Century)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AC\u09BF\u0995\u09B2\u09CD\u09AA \u099A\u09BF\u09A8\u09CD\u09A4\u09BE \u0993 \u0989\u09A6\u09CD\u09AF\u09CB\u0997 (\u0989\u09A8\u09AC\u09BF\u0982\u09B6 \u09B6\u09A4\u0995\u09C7\u09B0 \u09AE\u09A7\u09CD\u09AF\u09AD\u09BE\u0997 \u09A5\u09C7\u0995\u09C7 \u09AC\u09BF\u0982\u09B6 \u09B6\u09A4\u0995\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A5\u09AE\u09AD\u09BE\u0997 \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4)", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u0935\u0948\u0915\u0932\u094D\u092A\u093F\u0915 \u0935\u093F\u091A\u093E\u0930 \u0914\u0930 \u092A\u0939\u0932 (19\u0935\u0940\u0902 \u0936\u0924\u093E\u092C\u094D\u0926\u0940 \u0915\u0947 \u092E\u0927\u094D\u092F \u0938\u0947 20\u0935\u0940\u0902 \u0936\u0924\u093E\u092C\u094D\u0926\u0940 \u0915\u0947 \u092A\u094D\u0930\u093E\u0930\u0902\u092D \u0924\u0915)", ["Serampore Mission Press, Upendrakishore Raychaudhuri (U.N. Ray & Sons halftone block printing)", "IACS (Mahendralal Sircar, 1876), Bose Institute (Acharya Jagadish Chandra Bose, 1917), Bengal Technical Institute (Taraknath Palit, 1906), National Council of Education (1906)", "Rabindranath Tagore educational philosophy: Brahmacharyashrama (Santiniketan, 1901) & Visva-Bharati (1921)"], TB_HIST_10),
        ch("h10_c6", 6, "Ch 6: Peasant, Working Class and Leftist Movements in 20th Century India", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09AC\u09BF\u0982\u09B6 \u09B6\u09A4\u0995\u09C7\u09B0 \u09AD\u09BE\u09B0\u09A4\u09C7 \u0995\u09C3\u09B7\u0995, \u09B6\u09CD\u09B0\u09AE\u09BF\u0995 \u0993 \u09AC\u09BE\u09AE\u09AA\u09A8\u09CD\u09A5\u09C0 \u0986\u09A8\u09CD\u09A6\u09CB\u09B2\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 6: 20\u0935\u0940\u0902 \u0936\u0924\u093E\u092C\u094D\u0926\u0940 \u0915\u0947 \u092D\u093E\u0930\u0924 \u092E\u0947\u0902 \u0915\u093F\u0938\u093E\u0928, \u092E\u091C\u093C\u0926\u0942\u0930 \u0914\u0930 \u0935\u093E\u092E\u092A\u0902\u0925\u0940 \u0906\u0902\u0926\u094B\u0932\u0928", ["Eka Movement (Madari Pasi), Bardoli Satyagraha (Vallabhbhai Patel, 1928), All India Kisan Sabha (1936), Tebhaga Movement (1946\u201347), Telangana Uprising", "AITUC (1920, Lala Lajpat Rai), Meerut Conspiracy Case (1929), CPI (M.N. Roy), Congress Socialist Party (1934), Tripuri Congress & Forward Bloc (1939), Workers & Peasants Party"], TB_HIST_10),
        ch("h10_c7", 7, "Ch 7: Movements Organized by Women, Students and Marginalized Groups in 20th Century India", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09AC\u09BF\u0982\u09B6 \u09B6\u09A4\u0995\u09C7\u09B0 \u09AD\u09BE\u09B0\u09A4\u09C7 \u09A8\u09BE\u09B0\u09C0, \u099B\u09BE\u09A4\u09CD\u09B0 \u0993 \u09AA\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4\u09BF\u0995 \u099C\u09A8\u0997\u09CB\u09B7\u09CD\u09A0\u09C0\u09B0 \u0986\u09A8\u09CD\u09A6\u09CB\u09B2\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 7: 20\u0935\u0940\u0902 \u0936\u0924\u093E\u092C\u094D\u0926\u0940 \u0915\u0947 \u092D\u093E\u0930\u0924 \u092E\u0947\u0902 \u092E\u0939\u093F\u0932\u093E, \u091B\u093E\u0924\u094D\u0930 \u0914\u0930 \u0938\u0940\u092E\u093E\u0902\u0924 \u0938\u092E\u0942\u0939\u094B\u0902 \u0915\u0947 \u0906\u0902\u0926\u094B\u0932\u0928", ["Women in Swadeshi (Sarala Devi, Sister Nivedita), Non-Cooperation (Basanti Devi), Civil Disobedience, Quit India (Matangini Hazra, Kanaklata Barua)", "Revolutionary women: Dipali Sangha (Leela Nag), Pritilata Waddedar, Kalpana Datta, Bina Das, Rani Jhansi Regiment (Lakshmi Swaminathan)", "Anti-Circular Society (Sachindraprasad Bose, 1905), Rashid Ali Day (1946)", "Namasudra Movement (Harichand & Guruchand Thakur), Dalit Movement (Jyotirao Phule Satyashodhak Samaj, Periyar Self-Respect Movement, Dr. B.R. Ambedkar & Poona Pact 1932)"], TB_HIST_10),
        ch("h10_c8", 8, "Ch 8: Post-Colonial India \u2014 Second Half of the 20th Century (1947\u20131964)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u0989\u09A4\u09CD\u09A4\u09B0-\u0994\u09AA\u09A8\u09BF\u09AC\u09C7\u09B6\u09BF\u0995 \u09AD\u09BE\u09B0\u09A4: \u09AC\u09BF\u0982\u09B6 \u09B6\u09A4\u0995\u09C7\u09B0 \u09A6\u09CD\u09AC\u09BF\u09A4\u09C0\u09AF\u09BC \u09AA\u09B0\u09CD\u09AC (\u09E7\u09EF\u09EA\u09ED\u2013\u09E7\u09EF\u09EC\u09EA)", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u0909\u0924\u094D\u0924\u0930-\u0914\u092A\u0928\u093F\u0935\u0947\u0936\u093F\u0915 \u092D\u093E\u0930\u0924: 20\u0935\u0940\u0902 \u0936\u0924\u093E\u092C\u094D\u0926\u0940 \u0915\u093E \u0909\u0924\u094D\u0924\u0930\u093E\u0930\u094D\u0927 (1947\u20131964)", ["Integration of Princely States (Sardar Vallabhbhai Patel, V.P. Menon, Instrument of Accession)", "Junagadh (plebiscite), Hyderabad (Operation Polo, 1948), Jammu & Kashmir (Hari Singh & Article 370)", "Refugee crisis in Punjab & Bengal, Nehru-Liaquat Pact (1950)", "Linguistic reorganization of states: Potti Sreeramulu, JVP Committee, Fazl Ali States Reorganization Commission (1953) & Act (1956)"], TB_HIST_10)
      ]
    }
  }
};
var GEOGRAPHY_SUBJECT = {
  id: "geography",
  name: {
    en: "Geography",
    bn: "\u09AD\u09C2\u0997\u09CB\u09B2 (Geography)",
    hi: "\u092D\u0942\u0917\u094B\u0932 (Geography)"
  },
  shortDesc: {
    en: "Physical, environmental, astronomical, regional, and Indian/West Bengal geography from official WBBSE Amader Prithibi and Bhugol o Paribesh textbooks.",
    bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6\u09C7\u09B0 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0 \u098F\u09AC\u0982 \u09AD\u09C2\u0997\u09CB\u09B2 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u0995\u09C3\u09A4\u09BF\u0995, \u0986\u099E\u09CD\u099A\u09B2\u09BF\u0995 \u098F\u09AC\u0982 \u09AD\u09BE\u09B0\u09A4 \u0993 \u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997\u09C7\u09B0 \u09AD\u09C2\u0997\u09CB\u09B2\u0964",
    hi: "WBBSE \u0915\u0940 \u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0943\u0925\u093F\u0935\u0940 \u0914\u0930 \u092D\u0942\u0917\u094B\u0932 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915\u094B\u0902 \u0938\u0947 \u092D\u094C\u0924\u093F\u0915, \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u0924\u0925\u093E \u092D\u093E\u0930\u0924 \u0914\u0930 \u092A\u0936\u094D\u091A\u093F\u092E \u092C\u0902\u0917\u093E\u0932 \u0915\u093E \u092D\u0942\u0917\u094B\u0932\u0964"
  },
  domainGuardKeywords: [
    "geography",
    "earth",
    "latitude",
    "longitude",
    "rotation",
    "revolution",
    "landform",
    "glacier",
    "river",
    "wind",
    "atmosphere",
    "hydrosphere",
    "climate",
    "soil",
    "agriculture",
    "industry",
    "map",
    "west bengal",
    "india"
  ],
  curriculumByClass: {
    5: {
      status: "integrated_evs",
      verificationStatus: "verified",
      applicableToClass: false,
      textbookName: TB_EVS_52,
      syllabusVersion: "WBBPE Primary Syllabus",
      officialSource: "WBBPE \u2014 Amader Paribesh Class V (Geography & Resources Units)",
      boardNote: {
        en: "In Class 5, Geography of West Bengal, Soil, Rivers & Sky are taught in Amader Paribesh.",
        bn: "\u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09A4\u09C7 \u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997\u09C7\u09B0 \u09AD\u09C2\u09AA\u09CD\u09B0\u0995\u09C3\u09A4\u09BF, \u09A8\u09A6\u09A8\u09A6\u09C0, \u0995\u09C3\u09B7\u09BF\u099C \u0993 \u0996\u09A8\u09BF\u099C \u09B8\u09AE\u09CD\u09AA\u09A6 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u0985\u09A8\u09CD\u09A4\u09B0\u09CD\u09AD\u09C1\u0995\u09CD\u09A4\u0964",
        hi: "\u0915\u0915\u094D\u0937\u093E 5 \u092E\u0947\u0902 \u092A\u0936\u094D\u091A\u093F\u092E \u092C\u0902\u0917\u093E\u0932 \u0915\u093E \u092D\u0942\u0917\u094B\u0932, \u0928\u0926\u093F\u092F\u093E\u0901, \u0915\u0943\u0937\u093F \u0914\u0930 \u0916\u0928\u093F\u091C \u0938\u0902\u0938\u093E\u0927\u0928 \u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0930\u093F\u0935\u0947\u0936 \u092E\u0947\u0902 \u0938\u092E\u093E\u0939\u093F\u0924 \u0939\u0948\u0902\u0964"
      },
      chapters: [
        ch("g5_c1", 1, "Ch 3: Physiography & Rivers of West Bengal (Darjeeling Himalayas, Rarh Plateau, Sundarbans Delta)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997\u09C7\u09B0 \u09AD\u09C2\u09AA\u09CD\u09B0\u0995\u09C3\u09A4\u09BF \u0993 \u09A8\u09A6\u09A8\u09A6\u09C0 (\u09B9\u09BF\u09AE\u09BE\u09B2\u09AF\u09BC, \u09B0\u09BE\u09A2\u09BC \u09AE\u09BE\u09B2\u09AD\u09C2\u09AE\u09BF \u0993 \u09B8\u09C1\u09A8\u09CD\u09A6\u09B0\u09AC\u09A8 \u09AC\u09A6\u09CD\u09AC\u09C0\u09AA)", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u092A\u0936\u094D\u091A\u093F\u092E \u092C\u0902\u0917\u093E\u0932 \u0915\u0940 \u092D\u0942-\u0906\u0915\u0943\u0924\u093F \u0914\u0930 \u0928\u0926\u093F\u092F\u093E\u0901 (\u0926\u093E\u0930\u094D\u091C\u093F\u0932\u093F\u0902\u0917 \u0939\u093F\u092E\u093E\u0932\u092F, \u0930\u093E\u0922\u093C \u092A\u0920\u093E\u0930 \u0914\u0930 \u0938\u0941\u0902\u0926\u0930\u092C\u0928 \u0921\u0947\u0932\u094D\u091F\u093E)", ["Sandakphu (highest peak of WB)", "Teesta, Torsha, Jaldhaka, Mahananda, Damodar, Rupnarayan, Bhagirathi-Hooghly, Matla, Bidyadhari"], TB_EVS_52),
        ch("g5_c2", 2, "Ch 5 & 6: Agriculture, Fisheries, Coalfields & Power Plants of West Bengal", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB \u0993 \u09EC: \u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997\u09C7\u09B0 \u0995\u09C3\u09B7\u09BF, \u09AE\u09CE\u09B8\u09CD\u09AF\u099A\u09BE\u09B7, \u0996\u09A8\u09BF\u099C \u09B8\u09AE\u09CD\u09AA\u09A6 \u0993 \u09A4\u09BE\u09AA\u09AC\u09BF\u09A6\u09CD\u09AF\u09C1\u09CE \u0995\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 5 \u0935 6: \u092A\u0936\u094D\u091A\u093F\u092E \u092C\u0902\u0917\u093E\u0932 \u0915\u0940 \u0915\u0943\u0937\u093F, \u092E\u0924\u094D\u0938\u094D\u092F \u092A\u093E\u0932\u0928, \u0915\u094B\u092F\u0932\u093E \u0915\u094D\u0937\u0947\u0924\u094D\u0930 \u0914\u0930 \u0924\u093E\u092A \u0935\u093F\u0926\u094D\u092F\u0941\u0924 \u0915\u0947\u0902\u0926\u094D\u0930", ["Aus, Aman, Boro paddy, Darjeeling tea, jute", "Raniganj coalfield, Kolaghat, Bakreswar, Farakka thermal power plants"], TB_EVS_52),
        ch("g5_c3", 3, "Ch 10: Sky, Solar System, Phases of Moon, Eclipses & Tides", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E6: \u0986\u0995\u09BE\u09B6, \u09B8\u09CC\u09B0\u099C\u0997\u09CE, \u099A\u09A8\u09CD\u09A6\u09CD\u09B0\u0995\u09B2\u09BE, \u0997\u09CD\u09B0\u09B9\u09A3 \u0993 \u099C\u09CB\u09AF\u09BC\u09BE\u09B0-\u09AD\u09BE\u099F\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 10: \u0906\u0915\u093E\u0936, \u0938\u094C\u0930\u092E\u0902\u0921\u0932, \u091A\u0902\u0926\u094D\u0930 \u0915\u0932\u093E\u090F\u0901, \u0917\u094D\u0930\u0939\u0923 \u0914\u0930 \u091C\u094D\u0935\u093E\u0930-\u092D\u093E\u091F\u093E", ["8 planets of Solar System", "Solar and Lunar eclipses", "High tide and low tide"], TB_EVS_52)
      ]
    },
    6: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_GEO_6,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Amader Prithibi Class VI (Chapters 1\u201311)",
      boardNote: {
        en: "Official WBBSE Class VI Amader Prithibi (Geography) \u2014 All 11 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0 (\u09AD\u09C2\u0997\u09CB\u09B2) \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E7\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 6 \u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0943\u0925\u093F\u0935\u0940 (\u092D\u0942\u0917\u094B\u0932) \u2014 \u0938\u092D\u0940 11 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("g6_c1", 1, "Ch 1: The Sky Full of Stars (Universe, Galaxies, Solar System, Planets, Satellites, Asteroids & Comets)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u0986\u0995\u09BE\u09B6 \u09AD\u09B0\u09BE \u09B8\u09C2\u09B0\u09CD\u09AF \u09A4\u09BE\u09B0\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u0924\u093E\u0930\u094B\u0902 \u092D\u0930\u093E \u0906\u0915\u093E\u0936 (\u092C\u094D\u0930\u0939\u094D\u092E\u093E\u0902\u0921, \u0906\u0915\u093E\u0936\u0917\u0902\u0917\u093E \u0914\u0930 \u0938\u094C\u0930\u092E\u0902\u0921\u0932)", ["Big Bang, Milky Way (Akashganga), Light Year", "Inner and outer planets, Moon phases, ISRO & NASA missions"], TB_GEO_6),
        ch("g6_c2", 2, "Ch 2: Is the Earth Round? (Geoid Shape, Horizon, Proofs & Eratosthenes)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0 \u0995\u09BF \u0997\u09CB\u09B2?", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u0915\u094D\u092F\u093E \u092A\u0943\u0925\u094D\u0935\u0940 \u0917\u094B\u0932 \u0939\u0948? (\u092D\u0942-\u0906\u092D \u0906\u0915\u0943\u0924\u093F)", ["Oblate spheroid / Geoid shape of Earth", "Magellan circumnavigation, Bedford Level experiment, Equatorial (12,757 km) vs Polar diameter (12,714 km)"], TB_GEO_6),
        ch("g6_c3", 3, "Ch 3: Where Are You? (Parallels of Latitude, Meridians of Longitude, Equator & Prime Meridian)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09A4\u09C1\u09AE\u09BF \u0995\u09CB\u09A5\u09BE\u09AF\u09BC \u0986\u099B? (\u0985\u0995\u09CD\u09B7\u09B0\u09C7\u0996\u09BE \u0993 \u09A6\u09CD\u09B0\u09BE\u0998\u09BF\u09AE\u09BE\u09B0\u09C7\u0996\u09BE)", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u0906\u092A \u0915\u0939\u093E\u0901 \u0939\u0948\u0902? (\u0905\u0915\u094D\u0937\u093E\u0902\u0936 \u0914\u0930 \u0926\u0947\u0936\u093E\u0902\u0924\u0930 \u0930\u0947\u0916\u093E\u090F\u0901)", ["Equator (0\xB0), Tropics of Cancer & Capricorn (23\xBD\xB0 N/S), Arctic & Antarctic Circles (66\xBD\xB0 N/S)", "Prime Meridian (0\xB0 Greenwich), Great Circles, Geographic Grid"], TB_GEO_6),
        ch("g6_c4", 4, "Ch 4: Rotation of the Earth (Daily Motion, Coriolis Effect, Circle of Illumination & Dawn/Dusk)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0\u09B0 \u0986\u09AC\u09B0\u09CD\u09A4\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u092A\u0943\u0925\u094D\u0935\u0940 \u0915\u093E \u0918\u0942\u0930\u094D\u0923\u0928 (\u0926\u0948\u0928\u093F\u0915 \u0917\u0924\u093F)", ["West-to-East rotation in 23h 56m 4s", "Circle of Illumination, Dawn & Dusk, Coriolis force (Ferrel Law), International Date Line (180\xB0)"], TB_GEO_6),
        ch("g6_c5", 5, "Ch 5: Land, Water and Air (Lithosphere, Hydrosphere, Atmosphere, Biosphere & Continental Drift)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u099C\u09B2-\u09B8\u09CD\u09A5\u09B2-\u09AC\u09BE\u09A4\u09BE\u09B8", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u091C\u0932, \u0925\u0932 \u0914\u0930 \u0935\u093E\u092F\u0941 (\u0938\u094D\u0925\u0932\u092E\u0902\u0921\u0932, \u091C\u0932\u092E\u0902\u0921\u0932, \u0935\u093E\u092F\u0941\u092E\u0902\u0921\u0932 \u0914\u0930 \u091C\u0940\u0935\u092E\u0902\u0921\u0932)", ["Wegener Pangaea & Panthalassa continental drift", "7 Continents & 5 Oceans", "Atmospheric layers (Troposphere to Exosphere)"], TB_GEO_6),
        ch("g6_c6", 6, "Ch 6: Ice Covered Continent \u2014 Antarctica", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09AC\u09B0\u09AB\u09C7 \u09A2\u09BE\u0995\u09BE \u09AE\u09B9\u09BE\u09A6\u09C7\u09B6 (\u0986\u09A8\u09CD\u099F\u09BE\u09B0\u09CD\u0995\u099F\u09BF\u0995\u09BE)", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u092C\u0930\u094D\u092B\u093C \u0938\u0947 \u0922\u0915\u093E \u092E\u0939\u093E\u0926\u094D\u0935\u0940\u092A (\u0905\u0902\u091F\u093E\u0930\u094D\u0915\u091F\u093F\u0915\u093E)", ["White Continent, Mt. Vinson Massif, Mt. Erebus, Lambert Glacier, Aurora Australis", " Penguins & Krill, Antarctic Treaty (1959), Indian research stations: Dakshin Gangotri, Maitri, Bharati"], TB_GEO_6),
        ch("g6_c7", 7, "Ch 7: Weather and Climate", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u0986\u09AC\u09B9\u09BE\u0993\u09AF\u09BC\u09BE \u0993 \u099C\u09B2\u09AC\u09BE\u09AF\u09BC\u09C1", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u092E\u094C\u0938\u092E \u0914\u0930 \u091C\u0932\u0935\u093E\u092F\u0941", ["Thermometer, Barometer, Hygrometer, Anemometer, Wind Vane, Rain Gauge", "Torrid, Temperate, and Frigid heat zones, Isotherms"], TB_GEO_6),
        ch("g6_c8", 8, "Ch 8: Air Pollution", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09AC\u09BE\u09AF\u09BC\u09C1\u09A6\u09C2\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u0935\u093E\u092F\u0941 \u092A\u094D\u0930\u0926\u0942\u0937\u0923", ["Greenhouse gases, Acid rain (SO2, NOx), Smog, Ozone depletion"], TB_GEO_6),
        ch("g6_c9", 9, "Ch 9: Noise Pollution", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u09B6\u09AC\u09CD\u09A6\u09A6\u09C2\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u0927\u094D\u0935\u0928\u093F \u092A\u094D\u0930\u0926\u0942\u0937\u0923", ["Decibel (dB) unit, WHO safe noise limits (65 dB), Green muffler"], TB_GEO_6),
        ch("g6_c10", 10, "Ch 10: Our Country India (Physiographic Divisions, Rivers, Climate, Soils, Forests & Tribes)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E6: \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09A6\u09C7\u09B6 \u09AD\u09BE\u09B0\u09A4", "\u0905\u0927\u094D\u092F\u093E\u092F 10: \u0939\u092E\u093E\u0930\u093E \u0926\u0947\u0936 \u092D\u093E\u0930\u0924 (\u092D\u094C\u0924\u093F\u0915 \u0935\u093F\u092D\u093E\u0917, \u0928\u0926\u093F\u092F\u093E\u0901, \u091C\u0932\u0935\u093E\u092F\u0941, \u092E\u093F\u091F\u094D\u091F\u0940 \u0914\u0930 \u0935\u0928)", ["28 States & 8 Union Territories, IST (82\xB030\u2032E)", "Northern Mountains (Himadri, Himachal, Siwalik), Northern Plains, Peninsular Plateau, Coastal Plains & Islands", "Himalayan vs Peninsular rivers, Monsoon seasons, Alluvial/Black/Red/Laterite soils, Natural vegetation"], TB_GEO_6),
        ch("g6_c11", 11, "Ch 11: Maps (Scale, Globe vs Map, Thematic Maps & Conventional Symbols)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E7: \u09AE\u09BE\u09A8\u099A\u09BF\u09A4\u09CD\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 11: \u092E\u093E\u0928\u091A\u093F\u0924\u094D\u0930 (\u092E\u093E\u092A\u0928\u0940, \u092A\u094D\u0930\u0915\u093E\u0930 \u0914\u0930 \u0930\u0942\u0922\u093C \u091A\u093F\u0939\u094D\u0928)", ["Physical, Political, Thematic, Topographical, and Cadastral (Mouza) maps", "Statement, Graphical, and Representative Fraction (RF) scales"], TB_GEO_6)
      ]
    },
    7: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_GEO_7,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Amader Prithibi Class VII (Chapters 1\u201311)",
      boardNote: {
        en: "Official WBBSE Class VII Amader Prithibi (Geography) \u2014 All 11 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0 (\u09AD\u09C2\u0997\u09CB\u09B2) \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E7\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 7 \u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0943\u0925\u093F\u0935\u0940 (\u092D\u0942\u0917\u094B\u0932) \u2014 \u0938\u092D\u0940 11 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("g7_c1", 1, "Ch 1: Annual Motion of the Earth (Revolution, Perihelion, Aphelion, Solstices, Equinoxes & Change of Seasons)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0\u09B0 \u09AA\u09B0\u09BF\u0995\u09CD\u09B0\u09AE\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092A\u0943\u0925\u094D\u0935\u0940 \u0915\u0940 \u092A\u0930\u093F\u0915\u094D\u0930\u092E\u0923 \u0917\u0924\u093F (\u0909\u092A\u0938\u094C\u0930, \u0905\u092A\u0938\u094C\u0930, \u0905\u092F\u0928\u093E\u0902\u0924, \u0935\u093F\u0937\u0941\u0935 \u0914\u0930 \u090B\u0924\u0941 \u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928)", ["365 days 5h 48m 46s orbit, Leap year", "Perihelion (3 Jan, 14.7 crore km) & Aphelion (4 July, 15.2 crore km)", "Summer Solstice (21 June), Winter Solstice (22 Dec), Vernal & Autumnal Equinoxes (21 March, 23 Sept), Midnight Sun"], TB_GEO_7),
        ch("g7_c2", 2, "Ch 2: Determination of Location of a Place on the Earth Surface (Latitude, Longitude & Time Calculation)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09AD\u09C2\u09AA\u09C3\u09B7\u09CD\u09A0\u09C7 \u0995\u09CB\u09A8\u09CB \u09B8\u09CD\u09A5\u09BE\u09A8\u09C7\u09B0 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE\u09A8 \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u092A\u0943\u0925\u094D\u0935\u0940 \u0915\u0940 \u0938\u0924\u0939 \u092A\u0930 \u0915\u093F\u0938\u0940 \u0938\u094D\u0925\u093E\u0928 \u0915\u0940 \u0938\u094D\u0925\u093F\u0924\u093F \u0915\u093E \u0928\u093F\u0930\u094D\u0927\u093E\u0930\u0923 (\u0938\u092E\u092F \u0914\u0930 \u0926\u0947\u0936\u093E\u0902\u0924\u0930 \u0917\u0923\u0928\u093E)", ["1\xB0 longitude = 4 minutes time difference", "Local Time, Standard Time (IST 82\xB030\u2032E = GMT + 5:30), Antipodes, Sextant & Chronometer"], TB_GEO_7),
        ch("g7_c3", 3, "Ch 3: Air Pressure (Pressure Belts, Isobars & Winds)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AC\u09BE\u09AF\u09BC\u09C1\u099A\u09BE\u09AA", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u0935\u093E\u092F\u0941\u0926\u093E\u092C (\u0935\u093E\u092F\u0941\u0926\u093E\u092C \u092A\u0947\u091F\u093F\u092F\u093E\u0901 \u0914\u0930 \u0938\u092E\u0926\u093E\u092C \u0930\u0947\u0916\u093E\u090F\u0901)", ["Normal sea-level pressure (1013.25 mb)", "7 permanent pressure belts of the world, Fortin & Aneroid barometers"], TB_GEO_7),
        ch("g7_c4", 4, "Ch 4: Landforms (Mountains, Plateaus and Plains)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09AD\u09C2\u09AE\u09BF\u09B0\u09C2\u09AA (\u09AA\u09B0\u09CD\u09AC\u09A4, \u09AE\u09BE\u09B2\u09AD\u09C2\u09AE\u09BF \u0993 \u09B8\u09AE\u09AD\u09C2\u09AE\u09BF)", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u0938\u094D\u0925\u0932\u0930\u0942\u092A (\u092A\u0930\u094D\u0935\u0924, \u092A\u0920\u093E\u0930 \u0914\u0930 \u092E\u0948\u0926\u093E\u0928)", ["Fold (Himalayas, Andes), Block (Satpura, Vosges), Volcanic (Fujiyama, Vesuvius), Residual (Aravalli) mountains", "Intermontane (Tibet, Pamir), Dissected, and Lava (Deccan Trap) plateaus", "Alluvial, Loess, and Erosional plains"], TB_GEO_7),
        ch("g7_c5", 5, "Ch 5: River (Course of a River, Erosional & Depositional Landforms)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09A8\u09A6\u09C0", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u0928\u0926\u0940 (\u0928\u0926\u0940 \u0915\u0947 \u0924\u0940\u0928 \u091A\u0930\u0923 \u0914\u0930 \u0938\u094D\u0925\u0932\u0930\u0942\u092A)", ["Catchment area, Watershed, Tributary & Distributary, Inland river (Luni)", "Upper course (I/V-shaped valley, gorge, canyon, waterfall, pothole)", "Middle course (meander, ox-bow lake, flood plain, natural levee)", "Lower course (delta & estuary)"], TB_GEO_7),
        ch("g7_c6", 6, "Ch 6: Rocks and Soil (Igneous, Sedimentary & Metamorphic Rocks; Regolith & Soil Profile)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09B6\u09BF\u09B2\u09BE \u0993 \u09AE\u09BE\u099F\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u091A\u091F\u094D\u091F\u093E\u0928\u0947\u0902 \u0914\u0930 \u092E\u093F\u091F\u094D\u091F\u0940 (\u0906\u0917\u094D\u0928\u0947\u092F, \u0905\u0935\u0938\u093E\u0926\u0940 \u0914\u0930 \u0915\u093E\u092F\u093E\u0902\u0924\u0930\u093F\u0924 \u091A\u091F\u094D\u091F\u093E\u0928\u0947\u0902; \u092E\u0943\u0926\u093E \u092A\u0930\u093F\u091A\u094D\u091B\u0947\u0926\u093F\u0915\u093E)", ["Granite & Basalt (Igneous), Sandstone, Limestone, Shale (Sedimentary), Marble, Slate, Quartzite, Gneiss (Metamorphic)", "Rock cycle, Weathering, Humus, Soil horizons"], TB_GEO_7),
        ch("g7_c7", 7, "Ch 7: Water Pollution", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u099C\u09B2\u09A6\u09C2\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u091C\u0932 \u092A\u094D\u0930\u0926\u0942\u0937\u0923", ["Arsenic (Blackfoot disease), Fluoride (Fluorosis), Mercury (Minamata), Cadmium (Itai-Itai), Eutrophication"], TB_GEO_7),
        ch("g7_c8", 8, "Ch 8: Soil Pollution", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09AE\u09BE\u099F\u09BF\u09A6\u09C2\u09B7\u09A3", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u092E\u0943\u0926\u093E \u092A\u094D\u0930\u0926\u0942\u0937\u0923", ["Plastic waste, chemical fertilizers, pesticides, industrial effluents, bio-remediation"], TB_GEO_7),
        ch("g7_c9", 9, "Ch 9: Continent of Asia (Physiography, Rivers, Climate, Vegetation & Regional Study)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u098F\u09B6\u09BF\u09AF\u09BC\u09BE \u09AE\u09B9\u09BE\u09A6\u09C7\u09B6", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u090F\u0936\u093F\u092F\u093E \u092E\u0939\u093E\u0926\u094D\u0935\u0940\u092A (\u092D\u0942-\u0906\u0915\u0943\u0924\u093F, \u0928\u0926\u093F\u092F\u093E\u0901, \u091C\u0932\u0935\u093E\u092F\u0941 \u0914\u0930 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u0905\u0927\u094D\u092F\u092F\u0928)", ["Pamir Knot, Tibetan Plateau, Ob, Yenisei, Lena, Hwang-Ho, Yangtze, Mekong, Tigris-Euphrates", "Equatorial to Tundra climate & vegetation belts", "Yangtze Basin, Tokyo-Yokohama Industrial Region, SW Asia Oil-Rich Region"], TB_GEO_7),
        ch("g7_c10", 10, "Ch 10: Continent of Africa (Physiography, Great Rift Valley, Nile Basin & Sahara Desert)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E6: \u0986\u09AB\u09CD\u09B0\u09BF\u0995\u09BE \u09AE\u09B9\u09BE\u09A6\u09C7\u09B6", "\u0905\u0927\u094D\u092F\u093E\u092F 10: \u0905\u092B\u093C\u094D\u0930\u0940\u0915\u093E \u092E\u0939\u093E\u0926\u094D\u0935\u0940\u092A (\u0928\u0940\u0932 \u0928\u0926\u0940 \u092C\u0947\u0938\u093F\u0928 \u0914\u0930 \u0938\u0939\u093E\u0930\u093E \u092E\u0930\u0941\u0938\u094D\u0925\u0932)", ["Atlas Mountains, Mt. Kilimanjaro, Great Rift Valley, Lake Victoria", "White Nile & Blue Nile (Khartoum confluence), Aswan High Dam, Sahara oases & nomadic tribes (Tuareg, Bedouin)"], TB_GEO_7),
        ch("g7_c11", 11, "Ch 11: Continent of Europe (Physiography, Ruhr Industrial Region, London Basin & Polder Land)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E7: \u0987\u0989\u09B0\u09CB\u09AA \u09AE\u09B9\u09BE\u09A6\u09C7\u09B6", "\u0905\u0927\u094D\u092F\u093E\u092F 11: \u092F\u0942\u0930\u094B\u092A \u092E\u0939\u093E\u0926\u094D\u0935\u0940\u092A (\u0930\u0942\u0930 \u0914\u0926\u094D\u092F\u094B\u0917\u093F\u0915 \u0915\u094D\u0937\u0947\u0924\u094D\u0930, \u0932\u0902\u0926\u0928 \u092C\u0947\u0938\u093F\u0928 \u0914\u0930 \u092A\u094B\u0932\u094D\u0921\u0930 \u092D\u0942\u092E\u093F)", ["Alps (Mont Blanc), Caucasus (Mt. Elbrus), Fjords of Norway, Volga, Danube, Rhine", "Ruhr Coalfield & Industrial Region (Germany), London Basin, Polder land reclamation in the Netherlands (Zuiderzee)"], TB_GEO_7)
      ]
    },
    8: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_GEO_8,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Amader Prithibi Class VIII (Chapters 1\u201311)",
      boardNote: {
        en: "Official WBBSE Class VIII Amader Prithibi (Geography) \u2014 All 11 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0 (\u09AD\u09C2\u0997\u09CB\u09B2) \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E7\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 8 \u0906\u092E\u093E\u0926\u0947\u0930 \u092A\u0943\u0925\u093F\u0935\u0940 (\u092D\u0942\u0917\u094B\u0932) \u2014 \u0938\u092D\u0940 11 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("g8_c1", 1, "Ch 1: Interior of the Earth (Crust, Mantle, Core, Discontinuities, Magma & Geothermal Energy)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0\u09B0 \u0985\u09A8\u09CD\u09A6\u09B0\u09AE\u09B9\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092A\u0943\u0925\u094D\u0935\u0940 \u0915\u093E \u0906\u0902\u0924\u0930\u093F\u0915 \u092D\u093E\u0917 (\u092D\u0942\u092A\u0930\u094D\u092A\u091F\u0940, \u092E\u0948\u0902\u091F\u0932 \u0914\u0930 \u0915\u094D\u0930\u094B\u0921)", ["SIAL and SIMA, Mohorovicic, Conrad, Repetti, Gutenberg & Lehmann discontinuities", "NIFE (Inner & Outer Core), P, S, and L seismic waves"], TB_GEO_8),
        ch("g8_c2", 2, "Ch 2: Unstable Earth (Plate Tectonics, Fold & Fault, Volcanoes & Earthquakes)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u0985\u09B8\u09CD\u09A5\u09BF\u09A4 \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0 (\u09AA\u09BE\u09A4 \u09B8\u0982\u09B8\u09CD\u09A5\u09BE\u09A8 \u09A4\u09A4\u09CD\u09A4\u09CD\u09AC, \u0985\u0997\u09CD\u09A8\u09CD\u09AF\u09C1\u09CE\u09AA\u09BE\u09A4 \u0993 \u09AD\u09C2\u09AE\u09BF\u0995\u09AE\u09CD\u09AA)", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u0905\u0938\u094D\u0925\u093F\u0930 \u092A\u0943\u0925\u094D\u0935\u0940 (\u092A\u094D\u0932\u0947\u091F \u0935\u093F\u0935\u0930\u094D\u0924\u0928\u093F\u0915\u0940, \u091C\u094D\u0935\u093E\u0932\u093E\u092E\u0941\u0916\u0940 \u0914\u0930 \u092D\u0942\u0915\u0902\u092A)", ["Convergent, Divergent, and Transform plate boundaries", "Active, Dormant, and Extinct volcanoes, Pacific Ring of Fire", "Focus (Hypocentre) & Epicentre, Seismograph, Richter & Mercalli scales"], TB_GEO_8),
        ch("g8_c3", 3, "Ch 3: Rocks (Detailed Petrology, Caves \u2014 Stalactite & Stalagmite, Rock Cycle)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09B6\u09BF\u09B2\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u091A\u091F\u094D\u091F\u093E\u0928\u0947\u0902 (\u0936\u0948\u0932 \u091A\u0915\u094D\u0930 \u0914\u0930 \u0915\u093E\u0930\u094D\u0938\u094D\u091F \u0938\u094D\u0925\u0932\u093E\u0915\u0943\u0924\u093F)", ["Intrusive (Plutonic/Hypabyssal) and Extrusive igneous rocks", "Karst limestone caves: Stalactite, Stalagmite & Pillar"], TB_GEO_8),
        ch("g8_c4", 4, "Ch 4: Pressure Belts and Winds (Planetary, Periodic, Local Winds, Cyclones & Anticyclones)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u099A\u09BE\u09AA\u09AC\u09B2\u09AF\u09BC \u0993 \u09AC\u09BE\u09AF\u09BC\u09C1\u09AA\u09CD\u09B0\u09AC\u09BE\u09B9", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u0935\u093E\u092F\u0941\u0926\u093E\u092C \u092A\u0947\u091F\u093F\u092F\u093E\u0901 \u0914\u0930 \u092A\u0935\u0928\u0947\u0902 (\u0917\u094D\u0930\u0939\u0940\u092F, \u0938\u093E\u092E\u092F\u093F\u0915 \u0914\u0930 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u092A\u0935\u0928\u0947\u0902)", ["ITCZ & Doldrums, Horse Latitudes", "Trade Winds, Westerlies (Roaring Forties, Furious Fifties, Screaming Sixties), Polar Winds", "Land & Sea breezes, Monsoon, Loo, Foehn, Chinook, Sirocco, Mistral; Jet Stream"], TB_GEO_8),
        ch("g8_c5", 5, "Ch 5: Clouds and Rain (Evaporation, Humidity, Clouds & Orographic, Convectional, Cyclonic Rainfall)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AE\u09C7\u0998-\u09AC\u09C3\u09B7\u09CD\u099F\u09BF", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u092C\u093E\u0926\u0932 \u0914\u0930 \u0935\u0930\u094D\u0937\u093E (\u0938\u0902\u0935\u0939\u0928\u0940\u092F, \u092A\u0930\u094D\u0935\u0924\u0940\u092F \u0914\u0930 \u091A\u0915\u094D\u0930\u0935\u093E\u0924\u0940 \u0935\u0930\u094D\u0937\u093E)", ["Relative Humidity, Dew point", "Cirrus, Cumulus, Stratus, Cumulonimbus clouds", "Convectional (4 o clock rain), Orographic (Windward vs Rain-shadow slope), and Frontal/Cyclonic rain"], TB_GEO_8),
        ch("g8_c6", 6, "Ch 6: Climate Regions of the World (Equatorial, Monsoon, Mediterranean & Tundra Biomes)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u099C\u09B2\u09AC\u09BE\u09AF\u09BC\u09C1 \u0985\u099E\u09CD\u099A\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u0935\u093F\u0936\u094D\u0935 \u0915\u0947 \u091C\u0932\u0935\u093E\u092F\u0941 \u092A\u094D\u0930\u0926\u0947\u0936 (\u092D\u0942\u092E\u0927\u094D\u092F\u0930\u0947\u0916\u0940\u092F, \u092E\u093E\u0928\u0938\u0942\u0928\u0940, \u092D\u0942\u092E\u0927\u094D\u092F\u0938\u093E\u0917\u0930\u0940\u092F \u0914\u0930 \u091F\u0941\u0902\u0921\u094D\u0930\u093E)", ["Selvas tropical rainforest (Amazon/Zaire)", "Mediterranean winter rainfall & citrus orchards", "Tundra permafrost, blizzards, Aurora, Inuit/Eskimo igloo & kayak"], TB_GEO_8),
        ch("g8_c7", 7, "Ch 7: Human Activities and Environmental Degradation", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09AE\u09BE\u09A8\u09C1\u09B7\u09C7\u09B0 \u0995\u09BE\u09B0\u09CD\u09AF\u09BE\u09AC\u09B2\u09BF \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6\u09C7\u09B0 \u0985\u09AC\u09A8\u09AE\u09A8", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u092E\u093E\u0928\u0935\u0940\u092F \u0915\u094D\u0930\u093F\u092F\u093E\u0915\u0932\u093E\u092A \u0914\u0930 \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923\u0940\u092F \u0905\u0935\u0928\u092F\u0928", ["Greenhouse effect, Chernobyl & Bhopal gas tragedy, Chipko movement, Sustainable development"], TB_GEO_8),
        ch("g8_c8", 8, "Ch 8: India\u2019s Neighbouring Countries and Their Relationship with India", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09AD\u09BE\u09B0\u09A4\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09B6\u09C0 \u09A6\u09C7\u09B6\u09B8\u09AE\u09C2\u09B9 \u0993 \u09A4\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u092D\u093E\u0930\u0924 \u0915\u0947 \u092A\u0921\u093C\u094B\u0938\u0940 \u0926\u0947\u0936 \u0914\u0930 \u0909\u0928\u0915\u0947 \u0938\u093E\u0925 \u0938\u0902\u092C\u0902\u0927", ["Nepal, Bhutan, Bangladesh, Myanmar, Sri Lanka, Pakistan, Maldives, Afghanistan, China \u2014 capitals, highest peaks, longest rivers & main products, SAARC"], TB_GEO_8),
        ch("g8_c9", 9, "Ch 9: Continent of North America (Physiography, Great Lakes, St. Lawrence, Prairie & Canadian Shield)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u0989\u09A4\u09CD\u09A4\u09B0 \u0986\u09AE\u09C7\u09B0\u09BF\u0995\u09BE \u09AE\u09B9\u09BE\u09A6\u09C7\u09B6", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u0909\u0924\u094D\u0924\u0930\u0940 \u0905\u092E\u0947\u0930\u093F\u0915\u093E \u092E\u0939\u093E\u0926\u094D\u0935\u0940\u092A (\u092E\u0939\u093E\u0928 \u091D\u0940\u0932\u0947\u0902, \u092A\u094D\u0930\u0947\u092F\u0930\u0940 \u0914\u0930 \u0915\u0928\u093E\u0921\u093E\u0908 \u0936\u0940\u0932\u094D\u0921)", ["Rocky & Appalachian Mountains, Grand Canyon, Mississippi-Missouri", "5 Great Lakes (HOMES: Huron, Ontario, Michigan, Erie, Superior), Niagara Falls", "Canadian Shield fur & paper industry, Prairie wheat basket & meat packing (Chicago)"], TB_GEO_8),
        ch("g8_c10", 10, "Ch 10: Continent of South America (Andes, Amazon Basin, Pampas & Lake Titicaca)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E6: \u09A6\u0995\u09CD\u09B7\u09BF\u09A3 \u0986\u09AE\u09C7\u09B0\u09BF\u0995\u09BE \u09AE\u09B9\u09BE\u09A6\u09C7\u09B6", "\u0905\u0927\u094D\u092F\u093E\u092F 10: \u0926\u0915\u094D\u0937\u093F\u0923 \u0905\u092E\u0947\u0930\u093F\u0915\u093E \u092E\u0939\u093E\u0926\u094D\u0935\u0940\u092A (\u090F\u0902\u0921\u0940\u091C, \u0905\u092E\u0947\u091C\u093C\u0928 \u092C\u0947\u0938\u093F\u0928 \u0914\u0930 \u092A\u092E\u094D\u092A\u093E\u0938)", ["Andes Mountains (Mt. Aconcagua), Lake Titicaca, Atacama & Patagonia deserts", "Amazon Selvas rainforest (Lungs of the World) & Pampas grasslands (Estancia, Alfalfa, Wheat & Cattle)"], TB_GEO_8),
        ch("g8_c11", 11, "Ch 11: Oceania (Australia, New Zealand, Great Barrier Reef, Murray-Darling Basin & Artesian Wells)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7\u09E7: \u0993\u09B6\u09BF\u09AF\u09BC\u09BE\u09A8\u09BF\u09AF\u09BC\u09BE \u09AE\u09B9\u09BE\u09A6\u09C7\u09B6", "\u0905\u0927\u094D\u092F\u093E\u092F 11: \u0913\u0936\u093F\u0928\u093F\u092F\u093E (\u0911\u0938\u094D\u091F\u094D\u0930\u0947\u0932\u093F\u092F\u093E, \u0928\u094D\u092F\u0942\u091C\u093C\u0940\u0932\u0948\u0902\u0921, \u0917\u094D\u0930\u0947\u091F \u092C\u0948\u0930\u093F\u092F\u0930 \u0930\u0940\u092B\u093C \u0914\u0930 \u092E\u0930\u0947-\u0921\u093E\u0930\u094D\u0932\u093F\u0902\u0917 \u092C\u0947\u0938\u093F\u0928)", ["Australasia, Melanesia, Micronesia, Polynesia", "Great Dividing Range (Mt. Kosciuszko), Great Artesian Basin, Great Barrier Reef", "Downs temperate grassland, Merino sheep rearing (Jackaroo), Kiwi & Kangaroo"], TB_GEO_8)
      ]
    },
    9: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_GEO_9,
      syllabusVersion: "WBBSE Secondary Curriculum (Current Edition)",
      officialSource: "WBBSE \u2014 Bhugol o Paribesh Class IX (Chapters 1\u20139)",
      boardNote: {
        en: "Official WBBSE Class IX Bhugol o Paribesh \u2014 All 9 Verified Chapters (including complete West Bengal Geography).",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u09AD\u09C2\u0997\u09CB\u09B2 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09EF\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC (\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997\u09C7\u09B0 \u09AD\u09C2\u0997\u09CB\u09B2 \u09B8\u09B9)\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 9 \u092D\u0942\u0917\u094B\u0932 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 \u2014 \u0938\u092D\u0940 9 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F (\u092A\u0936\u094D\u091A\u093F\u092E \u092C\u0902\u0917\u093E\u0932 \u0915\u0947 \u092D\u0942\u0917\u094B\u0932 \u0938\u0939\u093F\u0924)\u0964"
      },
      chapters: [
        ch("g9_c1", 1, "Ch 1: Earth as a Planet (Geoid Shape, Unique Habitability & GPS)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u0997\u09CD\u09B0\u09B9\u09B0\u09C2\u09AA\u09C7 \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u090F\u0915 \u0917\u094D\u0930\u0939 \u0915\u0947 \u0930\u0942\u092A \u092E\u0947\u0902 \u092A\u0943\u0925\u094D\u0935\u0940 (\u092D\u0942-\u0906\u092D \u0906\u0915\u0943\u0924\u093F \u0914\u0930 GPS)", ["Proofs of spherical shape, Oblate Spheroid / Geoid (Johann Benedict Listing)", "Circumference calculation by Eratosthenes, Global Positioning System (GPS)"], TB_GEO_9),
        ch("g9_c2", 2, "Ch 2: Movements of the Earth (Rotation, Coriolis Effect, Revolution, Seasons & Eclipses)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0\u09B0 \u0997\u09A4\u09BF\u09B8\u09AE\u09C2\u09B9", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u092A\u0943\u0925\u094D\u0935\u0940 \u0915\u0940 \u0917\u0924\u093F\u092F\u093E\u0901 (\u0918\u0942\u0930\u094D\u0923\u0928 \u0914\u0930 \u092A\u0930\u093F\u0915\u094D\u0930\u092E\u0923)", ["Rotational speed variation from Equator (1670 km/h) to Poles (0 km/h)", "Foucault Pendulum, Ferrel Law, Perihelion/Aphelion, Solstices & Equinoxes"], TB_GEO_9),
        ch("g9_c3", 3, "Ch 3: Determination of Location of a Place on the Earth Surface (Latitude, Longitude & Time Calculation)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AD\u09C2\u09AA\u09C3\u09B7\u09CD\u09A0\u09C7 \u0995\u09CB\u09A8\u09CB \u09B8\u09CD\u09A5\u09BE\u09A8\u09C7\u09B0 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE\u09A8 \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u092A\u0943\u0925\u094D\u0935\u0940 \u0915\u0940 \u0938\u0924\u0939 \u092A\u0930 \u0938\u094D\u0925\u093E\u0928 \u0915\u093E \u0928\u093F\u0930\u094D\u0927\u093E\u0930\u0923 (\u0905\u0915\u094D\u0937\u093E\u0902\u0936, \u0926\u0947\u0936\u093E\u0902\u0924\u0930 \u0914\u0930 \u0938\u092E\u092F \u0917\u0923\u0928\u093E)", ["Properties of Parallels & Meridians, Great Circles", "Local Time vs Standard Time numerical problems, GMT, IST (82\xB030\u2032E), Antipodes & International Date Line (180\xB0)"], TB_GEO_9),
        ch("g9_c4", 4, "Ch 4: Geomorphic Processes and Landforms of the Earth (Endogenic/Exogenic, Mountains, Plateaus & Plains)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09AD\u09C2\u09AE\u09BF\u09B0\u09C2\u09AA \u0997\u09A0\u09A8\u0995\u09BE\u09B0\u09C0 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE \u0993 \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0\u09B0 \u09AC\u09BF\u09AD\u09BF\u09A8\u09CD\u09A8 \u09AD\u09C2\u09AE\u09BF\u09B0\u09C2\u09AA", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u092D\u0942-\u0906\u0915\u0943\u0924\u093F\u0915 \u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E\u090F\u0901 \u0914\u0930 \u092A\u0943\u0925\u094D\u0935\u0940 \u0915\u0947 \u0935\u093F\u092D\u093F\u0928\u094D\u0928 \u0938\u094D\u0925\u0932\u0930\u0942\u092A", ["Endogenic (diastrophic: epeirogenic & orogenic; sudden) and Exogenic (gradation: degradation & aggradation) processes", "Plate Tectonics & Fold, Block, Volcanic, Residual mountains; Intermontane, Piedmont, Continental, Lava plateaus; Structural, Erosional & Depositional plains"], TB_GEO_9),
        ch("g9_c5", 5, "Ch 5: Weathering (Mechanical, Chemical & Biological Weathering, Mass Wasting & Soil Conservation)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u0986\u09AC\u09B9\u09AC\u09BF\u0995\u09BE\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u0905\u092A\u0915\u094D\u0937\u092F (\u092D\u094C\u0924\u093F\u0915, \u0930\u093E\u0938\u093E\u092F\u0928\u093F\u0915 \u0914\u0930 \u091C\u0948\u0935\u093F\u0915 \u0905\u092A\u0915\u094D\u0937\u092F \u090F\u0935\u0902 \u092E\u0943\u0926\u093E \u0905\u092A\u0930\u0926\u0928)", ["Weathering vs Erosion vs Denudation vs Mass Wasting", "Exfoliation (onion-peeling), Block disintegration, Granular disintegration, Frost shattering", "Oxidation, Carbonation, Hydration, Hydrolysis; Regolith, Laterization & Soil conservation"], TB_GEO_9),
        ch("g9_c6", 6, "Ch 6: Hazards and Disasters (Floods, Droughts, Cyclones, Earthquakes, Tsunamis, Landslides & Avalanches)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u09A6\u09C1\u09B0\u09CD\u09AF\u09CB\u0997 \u0993 \u09AC\u09BF\u09AA\u09B0\u09CD\u09AF\u09AF\u09BC", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u0906\u092A\u0926\u093E \u0914\u0930 \u0938\u0902\u0915\u091F (\u092C\u093E\u0922\u093C, \u0938\u0942\u0916\u093E, \u091A\u0915\u094D\u0930\u0935\u093E\u0924, \u092D\u0942\u0915\u0902\u092A, \u0938\u0941\u0928\u093E\u092E\u0940 \u0914\u0930 \u092D\u0942\u0938\u094D\u0916\u0932\u0928)", ["Difference between Hazard (Duryog) and Disaster (Biparjay)", "Natural, Quasi-natural, and Man-made disasters", "Pre-disaster, During-disaster, and Post-disaster management in West Bengal"], TB_GEO_9),
        ch("g9_c7", 7, "Ch 7: Resources of India (Renewable/Non-Renewable, Iron Ore, Coal, Petroleum, Hydel, Thermal, Nuclear & Non-Conventional Energy)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09ED: \u09AD\u09BE\u09B0\u09A4\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09A6", "\u0905\u0927\u094D\u092F\u093E\u092F 7: \u092D\u093E\u0930\u0924 \u0915\u0947 \u0938\u0902\u0938\u093E\u0927\u0928 (\u0932\u094C\u0939 \u0905\u092F\u0938\u094D\u0915, \u0915\u094B\u092F\u0932\u093E, \u092A\u0947\u091F\u094D\u0930\u094B\u0932\u093F\u092F\u092E \u0914\u0930 \u090A\u0930\u094D\u091C\u093E \u0938\u0902\u0938\u093E\u0927\u0928)", ["Zimmermann's functional theory of resources", "Magnetite, Haematite, Limonite, Siderite iron ores; Anthracite, Bituminous (Gondwana), Lignite, Peat coal", "Bombay High, Digboi, Ankleshwar oilfields; Nuclear power plants (Tarapur, Kalpakkam, Kudankulam, Narora, Kakrapar, Rawatbhata, Kaiga); Solar, Wind, Geothermal & Tidal energy"], TB_GEO_9),
        ch("g9_c8", 8, "Ch 8: West Bengal (Location, Administrative Divisions, Physiography, Rivers, Climate, Soil, Vegetation, Agriculture, Industry, Population & Tourism)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EE: \u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 (\u0985\u09AC\u09B8\u09CD\u09A5\u09BE\u09A8, \u09AA\u09CD\u09B0\u09B6\u09BE\u09B8\u09A8\u09BF\u0995 \u09AC\u09BF\u09AD\u09BE\u0997, \u09AD\u09C2\u09AA\u09CD\u09B0\u0995\u09C3\u09A4\u09BF, \u09A8\u09A6\u09A8\u09A6\u09C0, \u099C\u09B2\u09AC\u09BE\u09AF\u09BC\u09C1, \u09AE\u09C3\u09A4\u09CD\u09A4\u09BF\u0995\u09BE, \u09B8\u09CD\u09AC\u09BE\u09AD\u09BE\u09AC\u09BF\u0995 \u0989\u09A6\u09CD\u09AD\u09BF\u09A6, \u0995\u09C3\u09B7\u09BF, \u09B6\u09BF\u09B2\u09CD\u09AA \u0993 \u099C\u09A8\u09B8\u0982\u0996\u09CD\u09AF\u09BE)", "\u0905\u0927\u094D\u092F\u093E\u092F 8: \u092A\u0936\u094D\u091A\u093F\u092E \u092C\u0902\u0917\u093E\u0932 (\u092A\u094D\u0930\u0936\u093E\u0938\u0928\u093F\u0915 \u0935\u093F\u092D\u093E\u0917, \u092D\u0942-\u0906\u0915\u0943\u0924\u093F, \u0928\u0926\u093F\u092F\u093E\u0901, \u091C\u0932\u0935\u093E\u092F\u0941, \u092E\u093F\u091F\u094D\u091F\u0940, \u0935\u0928, \u0915\u0943\u0937\u093F \u0914\u0930 \u0909\u0926\u094D\u092F\u094B\u0917)", ["5 Administrative Divisions & 23 Districts of West Bengal", "Northern Mountains (Singalila & Darjeeling ranges, Sandakphu 3636 m, Buxa-Jayanti)", "Western Plateau (Gorgaburu in Ayodhya hills, Susunia, Mama-Bhagne)", "Plains (Terai-Dooars, Barind, Diara, Tal, Rarh, Sandy Coastal, Active/Mature/Moribund Sundarbans Delta)", "Tea (Darjeeling), Jute (Hooghly basin), Iron & Steel (Durgapur, Burnpur-Kulti), Petrochemicals (Haldia), IT (Salt Lake Sector V & New Town)"], TB_GEO_9),
        ch("g9_c9", 9, "Ch 9: Maps and Scale (Classification of Maps, RF, Linear Scale & Cartographic Uses)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EF: \u09AE\u09BE\u09A8\u099A\u09BF\u09A4\u09CD\u09B0 \u0993 \u09B8\u09CD\u0995\u09C7\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 9: \u092E\u093E\u0928\u091A\u093F\u0924\u094D\u0930 \u0914\u0930 \u092E\u093E\u092A\u0928\u0940 (\u092A\u094D\u0930\u0926\u0930\u094D\u0936\u0915 \u092D\u093F\u0928\u094D\u0928 RF \u0914\u0930 \u0930\u0948\u0916\u093F\u0915 \u092E\u093E\u092A\u0928\u0940)", ["Small-scale (Wall, Atlas) vs Large-scale (Topographical, Cadastral/Mouza) maps", "Statement scale, Graphical/Linear scale (Primary & Secondary divisions), Vernier scale, and Representative Fraction (RF = Map Distance / Ground Distance)"], TB_GEO_9)
      ]
    },
    10: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_GEO_10,
      syllabusVersion: "WBBSE Madhyamik Pariksha Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Bhugol o Paribesh Class X (Chapters 1\u20136)",
      boardNote: {
        en: "Official WBBSE Class X Bhugol o Paribesh (Madhyamik Pariksha) \u2014 All 6 Verified Chapters.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u09AD\u09C2\u0997\u09CB\u09B2 \u0993 \u09AA\u09B0\u09BF\u09AC\u09C7\u09B6 (\u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995) \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09EC\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 10 \u092D\u0942\u0917\u094B\u0932 \u0913 \u092A\u0930\u093F\u0935\u0947\u0936 (\u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E) \u2014 \u0938\u092D\u0940 6 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("g10_c1", 1, "Ch 1: Exogenetic Processes and Resultant Landforms (Fluvial, Glacial & Aeolian Work)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E7: \u09AC\u09B9\u09BF\u09B0\u09CD\u099C\u09BE\u09A4 \u09AA\u09CD\u09B0\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE \u0993 \u09A4\u09BE\u09A6\u09C7\u09B0 \u09A6\u09CD\u09AC\u09BE\u09B0\u09BE \u09B8\u09C3\u09B7\u09CD\u099F \u09AD\u09C2\u09AE\u09BF\u09B0\u09C2\u09AA", "\u0905\u0927\u094D\u092F\u093E\u092F 1: \u092C\u0939\u093F\u0930\u094D\u091C\u093E\u0924 \u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E\u090F\u0901 \u0914\u0930 \u0909\u0928\u0938\u0947 \u0928\u093F\u0930\u094D\u092E\u093F\u0924 \u0938\u094D\u0925\u0932\u0930\u0942\u092A (\u0928\u0926\u0940, \u0939\u093F\u092E\u0928\u0926 \u0914\u0930 \u092A\u0935\u0928 \u0915\u0947 \u0915\u093E\u0930\u094D\u092F)", ["Degradation, Aggradation & Gradation; Six-power law of river velocity", "River landforms: Gorge, Canyon, Waterfall, Pothole, Alluvial Cone/Fan, Meander, Ox-bow Lake, Floodplain, Natural Levee, Delta (Arcuate, Bird-foot, Cuspate)", "Glacial landforms: Cirque/Corrie, Ar\xEAte, Pyramidal Peak (Horn), U-shaped Valley, Hanging Valley, Fjord, Roche Moutonn\xE9e, Crag & Tail, Moraines, Drumlin (Basket of Egg topography), Esker, Kame, Outwash Plain", "Wind (Aeolian) landforms: Deflation Hollow, Gour/Mushroom Rock, Zeugen, Yardang, Inselberg, Sand Dunes (Barchan & Seif), Loess, Wadis, Pediment, Bajada, Playa"], TB_GEO_10),
        ch("g10_c2", 2, "Ch 2: Atmosphere (Layers, Insolation, Heat Budget, Temperature, Pressure Belts, Winds, Humidity & Rainfall)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E8: \u09AC\u09BE\u09AF\u09BC\u09C1\u09AE\u09A3\u09CD\u09A1\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 2: \u0935\u093E\u092F\u0941\u092E\u0902\u0921\u0932 (\u0938\u0902\u0930\u091A\u0928\u093E, \u0938\u0942\u0930\u094D\u092F\u093E\u0924\u092A, \u090A\u0937\u094D\u092E\u093E \u092C\u091C\u091F, \u0935\u093E\u092F\u0941\u0926\u093E\u092C \u092A\u0947\u091F\u093F\u092F\u093E\u0901, \u092A\u0935\u0928\u0947\u0902 \u0914\u0930 \u0935\u0930\u094D\u0937\u0923)", ["Gaseous composition & Aerosols; Troposphere, Stratosphere, Mesosphere, Thermosphere/Ionosphere, Exosphere, Magnetosphere", "Insolation & Heat Budget (Albedo 35% + 65% absorbed & re-radiated); Conduction, Convection, Radiation, Advection; Inversion of Temperature (Katabatic/Anabatic winds)", "7 Pressure Belts, Coriolis force, Geostrophic wind, Jet Stream, Tropical Cyclones vs Temperate Mid-latitude Cyclones, Anticyclones, El Ni\xF1o & La Ni\xF1a", "Absolute, Specific & Relative Humidity; Orographic, Convectional & Cyclonic rainfall; K\xF6ppen climate classification"], TB_GEO_10),
        ch("g10_c3", 3, "Ch 3: Hydrosphere (Ocean Currents & Tides)", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09E9: \u09AC\u09BE\u09B0\u09BF\u09AE\u09A3\u09CD\u09A1\u09B2", "\u0905\u0927\u094D\u092F\u093E\u092F 3: \u091C\u0932\u092E\u0902\u0921\u0932 (\u092E\u0939\u093E\u0938\u093E\u0917\u0930\u0940\u092F \u0927\u093E\u0930\u093E\u090F\u0901 \u0914\u0930 \u091C\u094D\u0935\u093E\u0930-\u092D\u093E\u091F\u093E)", ["Warm and Cold Ocean Currents of Pacific (Kuroshio, Oyashio, Peru/Humboldt), Atlantic (Gulf Stream, Labrador, Canary, Benguela, Brazil, Falkland) & Indian Oceans", "Grand Banks & Dogger Bank fishing grounds, Sargasso Sea", "Primary (Lunar/Solar gravity) & Secondary (Centrifugal force) causes of Tides; Spring Tide (Syzygy: Conjunction & Opposition), Neap Tide, Apogean & Perigean Tides, Time interval between two high tides (12h 26m), Tidal Bore (Ban daka in Hooghly)"], TB_GEO_10),
        ch("g10_c4", 4, "Ch 4: Waste Management", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EA: \u09AC\u09B0\u09CD\u099C\u09CD\u09AF \u09AC\u09CD\u09AF\u09AC\u09B8\u09CD\u09A5\u09BE\u09AA\u09A8\u09BE", "\u0905\u0927\u094D\u092F\u093E\u092F 4: \u0905\u092A\u0936\u093F\u0937\u094D\u091F \u092A\u094D\u0930\u092C\u0902\u0927\u0928", ["Solid, Liquid, Gaseous, Toxic & Non-toxic, Biodegradable & Non-biodegradable, E-waste & Biomedical waste", "Effects of waste on Ganga River, agriculture & human health", "4R Principle (Reduce, Refuse, Reuse, Recycle), Segregation, Landfill, Composting/Vermicomposting, Scrubber (gaseous waste) & Sewage treatment"], TB_GEO_10),
        ch("g10_c5", 5, "Ch 5: India \u2014 Physical and Economic Geography", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EB: \u09AD\u09BE\u09B0\u09A4 (\u09AA\u09CD\u09B0\u09BE\u0995\u09C3\u09A4\u09BF\u0995 \u0993 \u0985\u09B0\u09CD\u09A5\u09A8\u09C8\u09A4\u09BF\u0995 \u09AD\u09C2\u0997\u09CB\u09B2)", "\u0905\u0927\u094D\u092F\u093E\u092F 5: \u092D\u093E\u0930\u0924 (\u092D\u094C\u0924\u093F\u0915 \u0914\u0930 \u0906\u0930\u094D\u0925\u093F\u0915 \u092D\u0942\u0917\u094B\u0932)", ["States reorganization (Telangana 2014, J&K and Ladakh UTs 2019), Indira Point & Indira Col", "Himalayan syntaxial bends, Passes, Karelis of Kashmir, Dun & Kayals (Malabar backwaters), Western vs Eastern Ghats", "Ganga, Indus, Brahmaputra & Peninsular rivers; Rainwater harvesting (Tamil Nadu mandatory)", "Monsoon burst, Western Disturbances, Mango Showers, Kalbaisakhi, Loo, October Heat (Ashwiner Jhar)", "Soils (Bhangar/Khadar, Regur/Black soil, Laterite) & Forests (Mangroves, Tropical Evergreen, Deciduous)", "Agriculture: Paddy, Wheat, Millet (Jowar, Bajra, Ragi), Sugarcane, Cotton, Tea, Coffee & Green Revolution", "Industries: Iron & Steel (TISCO, Bhilai, Rourkela, Durgapur, Bokaro, Salem), Cotton Textile (Ahmedabad Manchester of India), Automobile, Petrochemical & IT (Bengaluru Silicon Valley)", "2011 Census Population density, Golden Quadrilateral, North-South & East-West Corridors, Major Ports"], TB_GEO_10),
        ch("g10_c6", 6, "Ch 6: Satellite Imagery and Topographical Map", "\u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09EC: \u0989\u09AA\u0997\u09CD\u09B0\u09B9 \u099A\u09BF\u09A4\u09CD\u09B0 \u0993 \u09AD\u09C2-\u09AC\u09C8\u099A\u09BF\u09A4\u09CD\u09B0\u09CD\u09AF\u09B8\u09C2\u099A\u0995 \u09AE\u09BE\u09A8\u099A\u09BF\u09A4\u09CD\u09B0", "\u0905\u0927\u094D\u092F\u093E\u092F 6: \u0909\u092A\u0917\u094D\u0930\u0939 \u091A\u093F\u0924\u094D\u0930 \u0914\u0930 \u0938\u094D\u0925\u0932\u093E\u0915\u0943\u0924\u093F\u0915 \u092E\u093E\u0928\u091A\u093F\u0924\u094D\u0930", ["Remote Sensing (Active vs Passive sensors), Geostationary (INSAT) vs Sun-Synchronous Polar (IRS) satellites", "False Colour Composite (FCC) bands & Spatial/Spectral/Radiometric/Temporal resolution", "Survey of India (SOI) Topographical sheets: Million sheet (1:1,000,000), Degree sheet (1:250,000), Fifteen-minute sheet (1:50,000, e.g., 73 J/10), Contour lines & Conventional Signs"], TB_GEO_10)
      ]
    }
  }
};
var HISTORY_GEOGRAPHY_LEGACY_SUBJECT = {
  id: "history_geography",
  name: {
    en: "History & Geography",
    bn: "\u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u0993 \u09AD\u09C2\u0997\u09CB\u09B2 (History & Geography)",
    hi: "\u0907\u0924\u093F\u0939\u093E\u0938 \u0914\u0930 \u092D\u0942\u0917\u094B\u0932 (History & Geography)"
  },
  shortDesc: {
    en: "Combined History & Geography curriculum archive.",
    bn: "\u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u0993 \u09AD\u09C2\u0997\u09CB\u09B2 \u09B8\u09AE\u09A8\u09CD\u09AC\u09BF\u09A4 \u09AA\u09BE\u09A0\u09CD\u09AF\u0995\u09CD\u09B0\u09AE\u0964",
    hi: "\u0907\u0924\u093F\u0939\u093E\u0938 \u0914\u0930 \u092D\u0942\u0917\u094B\u0932 \u0938\u0902\u092F\u0941\u0915\u094D\u0924 \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E\u0964"
  },
  domainGuardKeywords: [
    ...HISTORY_SUBJECT.domainGuardKeywords,
    ...GEOGRAPHY_SUBJECT.domainGuardKeywords
  ],
  curriculumByClass: {
    5: {
      ...HISTORY_SUBJECT.curriculumByClass[5],
      applicableToClass: false,
      chapters: [
        ...HISTORY_SUBJECT.curriculumByClass[5].chapters,
        ...GEOGRAPHY_SUBJECT.curriculumByClass[5].chapters
      ]
    },
    6: {
      ...HISTORY_SUBJECT.curriculumByClass[6],
      applicableToClass: false,
      chapters: [
        ...HISTORY_SUBJECT.curriculumByClass[6].chapters,
        ...GEOGRAPHY_SUBJECT.curriculumByClass[6].chapters
      ]
    },
    7: {
      ...HISTORY_SUBJECT.curriculumByClass[7],
      applicableToClass: false,
      chapters: [
        ...HISTORY_SUBJECT.curriculumByClass[7].chapters,
        ...GEOGRAPHY_SUBJECT.curriculumByClass[7].chapters
      ]
    },
    8: {
      ...HISTORY_SUBJECT.curriculumByClass[8],
      applicableToClass: false,
      chapters: [
        ...HISTORY_SUBJECT.curriculumByClass[8].chapters,
        ...GEOGRAPHY_SUBJECT.curriculumByClass[8].chapters
      ]
    },
    9: {
      ...HISTORY_SUBJECT.curriculumByClass[9],
      applicableToClass: false,
      chapters: [
        ...HISTORY_SUBJECT.curriculumByClass[9].chapters,
        ...GEOGRAPHY_SUBJECT.curriculumByClass[9].chapters
      ]
    },
    10: {
      ...HISTORY_SUBJECT.curriculumByClass[10],
      applicableToClass: false,
      chapters: [
        ...HISTORY_SUBJECT.curriculumByClass[10].chapters,
        ...GEOGRAPHY_SUBJECT.curriculumByClass[10].chapters
      ]
    }
  }
};

// src/data/curriculumLanguages.ts
var TB_ENG_5 = {
  en: "Butterfly \u2014 English Textbook for Class V (WBBPE)",
  bn: "Butterfly \u2014 \u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0987\u0982\u09B0\u09C7\u099C\u09BF \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995 (WBBPE)",
  hi: "Butterfly \u2014 \u0915\u0915\u094D\u0937\u093E 5 \u0905\u0902\u0917\u094D\u0930\u0947\u091C\u093C\u0940 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 (WBBPE)"
};
var TB_ENG_6 = {
  en: "Blossoms \u2014 English Textbook for Class VI (WBBSE)",
  bn: "Blossoms \u2014 \u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0987\u0982\u09B0\u09C7\u099C\u09BF \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995 (WBBSE)",
  hi: "Blossoms \u2014 \u0915\u0915\u094D\u0937\u093E 6 \u0905\u0902\u0917\u094D\u0930\u0947\u091C\u093C\u0940 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 (WBBSE)"
};
var TB_ENG_7 = {
  en: "Blossoms \u2014 English Textbook for Class VII (WBBSE)",
  bn: "Blossoms \u2014 \u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0987\u0982\u09B0\u09C7\u099C\u09BF \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995 (WBBSE)",
  hi: "Blossoms \u2014 \u0915\u0915\u094D\u0937\u093E 7 \u0905\u0902\u0917\u094D\u0930\u0947\u091C\u093C\u0940 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 (WBBSE)"
};
var TB_ENG_8 = {
  en: "Blossoms \u2014 English Textbook for Class VIII (WBBSE)",
  bn: "Blossoms \u2014 \u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0987\u0982\u09B0\u09C7\u099C\u09BF \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995 (WBBSE)",
  hi: "Blossoms \u2014 \u0915\u0915\u094D\u0937\u093E 8 \u0905\u0902\u0917\u094D\u0930\u0947\u091C\u093C\u0940 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 (WBBSE)"
};
var TB_ENG_9 = {
  en: "Bliss \u2014 English Textbook for Class IX (WBBSE)",
  bn: "Bliss \u2014 \u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0987\u0982\u09B0\u09C7\u099C\u09BF \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995 (WBBSE)",
  hi: "Bliss \u2014 \u0915\u0915\u094D\u0937\u093E 9 \u0905\u0902\u0917\u094D\u0930\u0947\u091C\u093C\u0940 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 (WBBSE)"
};
var TB_ENG_10 = {
  en: "Bliss \u2014 English Textbook for Class X (WBBSE Madhyamik)",
  bn: "Bliss \u2014 \u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u0987\u0982\u09B0\u09C7\u099C\u09BF \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995 (WBBSE \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995)",
  hi: "Bliss \u2014 \u0915\u0915\u094D\u0937\u093E 10 \u0905\u0902\u0917\u094D\u0930\u0947\u091C\u093C\u0940 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 (WBBSE \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915)"
};
var TB_BN_5 = {
  en: "Patabahar & Bhashapallab (Class V \u2014 WBBPE)",
  bn: "\u09AA\u09BE\u09A4\u09BE\u09AC\u09BE\u09B9\u09BE\u09B0 \u0993 \u09AD\u09BE\u09B7\u09BE\u09AA\u09B2\u09CD\u09B2\u09AC (\u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBPE)",
  hi: "\u092A\u093E\u0924\u093E\u092C\u093E\u0939\u093E\u0930 \u0914\u0930 \u092D\u093E\u0937\u093E\u092A\u0932\u094D\u0932\u0935 (\u0915\u0915\u094D\u0937\u093E 5 \u2014 WBBPE)"
};
var TB_BN_6 = {
  en: "Sahitya Mela, Bhashacharcha & Haja-Bara-La (Class VI \u2014 WBBSE)",
  bn: "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE, \u09AD\u09BE\u09B7\u09BE\u099A\u09B0\u09CD\u099A\u09BE \u0993 \u09B9\u09AF\u09AC\u09B0\u09B2 (\u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E, \u092D\u093E\u0937\u093E\u091A\u0930\u094D\u091A\u093E \u0914\u0930 \u0939-\u092F-\u092C-\u0930-\u0932 (\u0915\u0915\u094D\u0937\u093E 6 \u2014 WBBSE)"
};
var TB_BN_7 = {
  en: "Sahitya Mela, Bhashacharcha & Maku (Class VII \u2014 WBBSE)",
  bn: "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE, \u09AD\u09BE\u09B7\u09BE\u099A\u09B0\u09CD\u099A\u09BE \u0993 \u09AE\u09BE\u0995\u09C1 (\u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E, \u092D\u093E\u0937\u093E\u091A\u0930\u094D\u091A\u093E \u0914\u0930 \u092E\u093E\u0915\u0942 (\u0915\u0915\u094D\u0937\u093E 7 \u2014 WBBSE)"
};
var TB_BN_8 = {
  en: "Sahitya Mela, Bhashacharcha & Chhotoder Mahabharat (Class VIII \u2014 WBBSE)",
  bn: "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE, \u09AD\u09BE\u09B7\u09BE\u099A\u09B0\u09CD\u099A\u09BE \u0993 \u099B\u09CB\u099F\u09A6\u09C7\u09B0 \u09AE\u09B9\u09BE\u09AD\u09BE\u09B0\u09A4 (\u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E, \u092D\u093E\u0937\u093E\u091A\u0930\u094D\u091A\u093E \u0914\u0930 \u091B\u094B\u091F\u094B\u0926\u0947\u0930 \u092E\u0939\u093E\u092D\u093E\u0930\u0924 (\u0915\u0915\u094D\u0937\u093E 8 \u2014 WBBSE)"
};
var TB_BN_9 = {
  en: "Sahitya Sanchayan, Bhasha Path & Professor Shonku (Class IX \u2014 WBBSE)",
  bn: "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8, \u09AD\u09BE\u09B7\u09BE\u09AA\u09BE\u09A0 \u0993 \u09AA\u09CD\u09B0\u09AB\u09C7\u09B8\u09B0 \u09B6\u0999\u09CD\u0995\u09C1\u09B0 \u09A1\u09BE\u09AF\u09BC\u09C7\u09B0\u09BF (\u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE)",
  hi: "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928, \u092D\u093E\u0937\u093E\u092A\u093E\u0920 \u0914\u0930 \u092A\u094D\u0930\u094B\u092B\u093C\u0947\u0938\u0930 \u0936\u0902\u0915\u0941 (\u0915\u0915\u094D\u0937\u093E 9 \u2014 WBBSE)"
};
var TB_BN_10 = {
  en: "Sahitya Sanchayan, Bhasha Path & Koni (Class X \u2014 WBBSE Madhyamik)",
  bn: "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8, \u09AD\u09BE\u09B7\u09BE\u09AA\u09BE\u09A0 \u0993 \u0995\u09CB\u09A8\u09BF (\u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u2014 WBBSE \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995)",
  hi: "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928, \u092D\u093E\u0937\u093E\u092A\u093E\u0920 \u0914\u0930 \u0915\u094B\u0928\u093F (\u0915\u0915\u094D\u0937\u093E 10 \u2014 WBBSE \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915)"
};
var TB_HI_PENDING = {
  en: "WBBSE Hindi Language Track (Medium/Elective \u2014 Pending Official Textbook Edition Verification)",
  bn: "WBBSE \u09B9\u09BF\u09A8\u09CD\u09A6\u09BF \u09AD\u09BE\u09B7\u09BE \u09AA\u09BE\u09A0\u09CD\u09AF\u0995\u09CD\u09B0\u09AE (\u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09AD\u09BF\u09A4\u09CD\u09A4\u09BF\u0995 \u2014 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09B8\u0982\u09B8\u09CD\u0995\u09B0\u09A3 \u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC)",
  hi: "WBBSE \u0939\u093F\u0902\u0926\u0940 \u092D\u093E\u0937\u093E \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E (\u092E\u093E\u0927\u094D\u092F\u092E-\u0906\u0927\u093E\u0930\u093F\u0924 \u2014 \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0938\u0902\u0938\u094D\u0915\u0930\u0923 \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0932\u0902\u092C\u093F\u0924)"
};
var ENGLISH_SUBJECT = {
  id: "english",
  name: {
    en: "English",
    bn: "\u0987\u0982\u09B0\u09C7\u099C\u09BF (English)",
    hi: "\u0905\u0902\u0917\u094D\u0930\u0947\u091C\u093C\u0940 (English)"
  },
  shortDesc: {
    en: "Prose, poetry, drama, reading comprehension, and English grammar from official WBBPE Butterfly and WBBSE Blossoms & Bliss textbooks.",
    bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AA\u09B0\u09CD\u09B7\u09A6\u09C7\u09B0 Butterfly, Blossoms \u098F\u09AC\u0982 Bliss \u0987\u0982\u09B0\u09C7\u099C\u09BF \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u0997\u09A6\u09CD\u09AF, \u0995\u09AC\u09BF\u09A4\u09BE, \u09A8\u09BE\u099F\u0995 \u0993 \u0987\u0982\u09B0\u09C7\u099C\u09BF \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3\u0964",
    hi: "WBBPE Butterfly \u0914\u0930 WBBSE Blossoms \u090F\u0935\u0902 Bliss \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915\u094B\u0902 \u0938\u0947 \u0917\u0926\u094D\u092F, \u092A\u0926\u094D\u092F, \u0928\u093E\u091F\u0915 \u0914\u0930 \u0905\u0902\u0917\u094D\u0930\u0947\u091C\u093C\u0940 \u0935\u094D\u092F\u093E\u0915\u0930\u0923\u0964"
  },
  domainGuardKeywords: [
    "english",
    "grammar",
    "tense",
    "voice",
    "narration",
    "preposition",
    "phrasal",
    "clause",
    "poem",
    "author",
    "prose",
    "synonym"
  ],
  curriculumByClass: {
    5: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_ENG_5,
      syllabusVersion: "WBBPE Primary Syllabus (Current Edition)",
      officialSource: "WBBPE \u2014 Butterfly Class V (Revision Lesson + Lessons 1\u201312)",
      boardNote: {
        en: "Official WBBPE Class V Butterfly \u2014 Revision Lesson + All 12 Verified Lessons.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBPE) \u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF Butterfly \u2014 \u09B0\u09BF\u09AD\u09BF\u09B6\u09A8 \u09B2\u09C7\u09B8\u09A8 \u0993 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E8\u099F\u09BF \u09AA\u09BE\u09A0\u0964",
        hi: "WBBPE \u0915\u0915\u094D\u0937\u093E 5 Butterfly \u2014 \u0930\u093F\u0935\u0940\u091C\u0928 \u0932\u0947\u0938\u0928 \u0914\u0930 \u0938\u092D\u0940 12 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u092A\u093E\u0920\u0964"
      },
      chapters: [
        ch("e5_c0", 1, "Revision Lesson: Comic Strip, Nouns, Pronouns & Articles", "\u09B0\u09BF\u09AD\u09BF\u09B6\u09A8 \u09B2\u09C7\u09B8\u09A8: Noun, Pronoun \u0993 Article \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8", "\u0930\u093F\u0935\u0940\u091C\u0928 \u0932\u0947\u0938\u0928: \u0938\u0902\u091C\u094D\u091E\u093E, \u0938\u0930\u094D\u0935\u0928\u093E\u092E \u0914\u0930 \u0906\u0930\u094D\u091F\u093F\u0915\u0932", ["Proper and common nouns", "Personal pronouns", "Use of a, an, the"], TB_ENG_5),
        ch("e5_c1", 2, "Lesson 1: Gandhi, The Mahatma", "\u09B2\u09C7\u09B8\u09A8 \u09E7: Gandhi, The Mahatma (\u09AE\u09B9\u09BE\u09A4\u09CD\u09AE\u09BE \u0997\u09BE\u09A8\u09CD\u09A7\u09C0)", "\u0932\u0947\u0938\u0928 1: Gandhi, The Mahatma", ["Mahatma Gandhi and the little boy", "Punctuation, singular/plural nouns, gender"], TB_ENG_5),
        ch("e5_c2", 3, "Lesson 2: A Feat on Feet (Edmund Hillary & Tenzing Norgay)", "\u09B2\u09C7\u09B8\u09A8 \u09E8: A Feat on Feet (\u098F\u09AD\u09BE\u09B0\u09C7\u09B8\u09CD\u099F \u099C\u09AF\u09BC)", "\u0932\u0947\u0938\u0928 2: A Feat on Feet (\u090F\u0935\u0930\u0947\u0938\u094D\u091F \u0935\u093F\u091C\u092F)", ["Ascent of Mt. Everest (29 May 1953)", "Proper adjectives and subject-predicate"], TB_ENG_5),
        ch("e5_c3", 4, "Lesson 3: Phulmani\u2019s India (Classical Dances & Folk Art of India)", "\u09B2\u09C7\u09B8\u09A8 \u09E9: Phulmani\u2019s India (\u09AD\u09BE\u09B0\u09A4\u09C7\u09B0 \u09B2\u09CB\u0995\u09B6\u09BF\u09B2\u09CD\u09AA \u0993 \u09A8\u09C3\u09A4\u09CD\u09AF\u0995\u09B2\u09BE)", "\u0932\u0947\u0938\u0928 3: Phulmani\u2019s India (\u092D\u093E\u0930\u0924 \u0915\u0940 \u0932\u094B\u0915 \u0915\u0932\u093E \u0914\u0930 \u0936\u093E\u0938\u094D\u0924\u094D\u0930\u0940\u092F \u0928\u0943\u0924\u094D\u092F)", ["Rock paintings of Bhimbetka, Patachitra, Bharatanatyam, Kathak, Kathakali, Manipuri, Odissi", "Simple Past Tense"], TB_ENG_5),
        ch("e5_c4", 5, "Lesson 4: Memory in Marble (The Taj Mahal \u2014 Shah Jahan & Mumtaz Mahal)", "\u09B2\u09C7\u09B8\u09A8 \u09EA: Memory in Marble (\u09A4\u09BE\u099C\u09AE\u09B9\u09B2)", "\u0932\u0947\u0938\u0928 4: Memory in Marble (\u0924\u093E\u091C\u092E\u0939\u0932)", ["Tarun grandfather story of Khurram (Shah Jahan) and Arjumand Banu Begum", "Prepositions and possessive pronouns"], TB_ENG_5),
        ch("e5_c5", 6, "Lesson 5: My School Days (Satyajit Ray \u2014 From Jakhan Chhoto Chhilam)", "\u09B2\u09C7\u09B8\u09A8 \u09EB: My School Days (\u09B8\u09A4\u09CD\u09AF\u099C\u09BF\u09CE \u09B0\u09BE\u09AF\u09BC \u2014 \u09AF\u0996\u09A8 \u099B\u09CB\u099F \u099B\u09BF\u09B2\u09BE\u09AE)", "\u0932\u0947\u0938\u0928 5: My School Days (\u0938\u0924\u094D\u092F\u091C\u0940\u0924 \u0930\u093E\u092F)", ["Ballygunge Government High School memories", "Present Continuous and Past Continuous Tense"], TB_ENG_5),
        ch("e5_c6", 7, "Lesson 6: The Clever Monkey (Folktale of Monkey & Crocodile)", "\u09B2\u09C7\u09B8\u09A8 \u09EC: The Clever Monkey (\u09AC\u09C1\u09A6\u09CD\u09A7\u09BF\u09AE\u09BE\u09A8 \u09AC\u09BE\u09A8\u09B0 \u0993 \u0995\u09C1\u09AE\u09BF\u09B0)", "\u0932\u0947\u0938\u0928 6: The Clever Monkey (\u091A\u0924\u0941\u0930 \u092C\u0902\u0926\u0930 \u0914\u0930 \u092E\u0917\u0930\u092E\u091A\u094D\u091B)", ["Jataka tale of clever monkey on river island", "Prepositions and opposite words"], TB_ENG_5),
        ch("e5_c7", 8, "Lesson 7: The Rebel Poet (Kazi Nazrul Islam)", "\u09B2\u09C7\u09B8\u09A8 \u09ED: The Rebel Poet (\u09AC\u09BF\u09A6\u09CD\u09B0\u09CB\u09B9\u09C0 \u0995\u09AC\u09BF \u0995\u09BE\u099C\u09C0 \u09A8\u099C\u09B0\u09C1\u09B2 \u0987\u09B8\u09B2\u09BE\u09AE)", "\u0932\u0947\u0938\u0928 7: The Rebel Poet (\u0935\u093F\u0926\u094D\u0930\u094B\u0939\u0940 \u0915\u0935\u093F \u0915\u093E\u091C\u093C\u0940 \u0928\u091C\u093C\u0930\u0941\u0932 \u0907\u0938\u094D\u0932\u093E\u092E)", ["Pritam and father discussion on Kazi Nazrul Islam (Churulia, Bidrohi, \u0986\u09A8\u09A8\u09CD\u09A6\u09AE\u09AF\u09BC\u09C0\u09B0 \u0986\u0997\u09AE\u09A8\u09C7)", "Adverbs of manner, time, and place"], TB_ENG_5),
        ch("e5_c8", 9, "Lesson 8: Buildings to Remember (Bandel Church, Hazarduari, Victoria Memorial, Rasmancha)", "\u09B2\u09C7\u09B8\u09A8 \u09EE: Buildings to Remember (\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997\u09C7\u09B0 \u0990\u09A4\u09BF\u09B9\u09BE\u09B8\u09BF\u0995 \u09B8\u09CD\u09A5\u09BE\u09AA\u09A4\u09CD\u09AF)", "\u0932\u0947\u0938\u0928 8: Buildings to Remember (\u092C\u0902\u0917\u093E\u0932 \u0915\u0940 \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u0907\u092E\u093E\u0930\u0924\u0947\u0902)", ["Mita heritage tour of Bandel Church, Bishnupur Rasmancha, Murshidabad Hazarduari, Kolkata Victoria Memorial", "Simple Present vs Present Perfect"], TB_ENG_5),
        ch("e5_c9", 10, "Lesson 9: The Bird\u2019s Eye (Dronacharya & Arjuna from the Mahabharata)", "\u09B2\u09C7\u09B8\u09A8 \u09EF: The Bird\u2019s Eye (\u09A6\u09CD\u09B0\u09CB\u09A3\u09BE\u099A\u09BE\u09B0\u09CD\u09AF \u0993 \u0985\u09B0\u09CD\u099C\u09C1\u09A8\u09C7\u09B0 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF\u09AD\u09C7\u09A6)", "\u0932\u0947\u0938\u0928 9: The Bird\u2019s Eye (\u0926\u094D\u0930\u094B\u0923\u093E\u091A\u093E\u0930\u094D\u092F \u0914\u0930 \u0905\u0930\u094D\u091C\u0941\u0928 \u0915\u0940 \u090F\u0915\u093E\u0917\u094D\u0930\u0924\u093E)", ["Archery test of Pandavas and Kauravas, Arjuna single-minded focus", "Adverbs and degrees of comparison"], TB_ENG_5),
        ch("e5_c10", 11, "Lesson 10: A Great Social Reformer (Begum Rokeya Sakhawat Hossain)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E6: A Great Social Reformer (\u09AC\u09C7\u0997\u09AE \u09B0\u09CB\u0995\u09C7\u09AF\u09BC\u09BE \u09B8\u09BE\u0996\u09BE\u0993\u09AF\u09BC\u09BE\u09A4 \u09B9\u09CB\u09B8\u09C7\u09A8)", "\u0932\u0947\u0938\u0928 10: A Great Social Reformer (\u092C\u0947\u0917\u092E \u0930\u0941\u0915\u0948\u092F\u093E \u0938\u0916\u093E\u0935\u0924 \u0939\u0941\u0938\u0948\u0928)", ["Sakhawat Memorial Girls School, Sultana Dream, Motichur", "Punctuation and verb forms"], TB_ENG_5),
        ch("e5_c11", 12, "Lesson 11:The Finishing Point (P.T. Usha \u2014 The Payyoli Express)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E7: The Finishing Point (\u09AA\u09BF. \u099F\u09BF. \u098A\u09B7\u09BE)", "\u0932\u0947\u0938\u0928 11: The Finishing Point (\u092A\u0940. \u091F\u0940. \u0909\u0937\u093E)", ["Pilavullakandi Thekkeparambil Usha, 1982 Asian Games, 1984 Los Angeles Olympics", "Modals (can, could, should, must)"], TB_ENG_5),
        ch("e5_c12", 13, "Lesson 12: Beyond Barriers (Rakesh Sharma & Kalpana Chawla in Space)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E8: Beyond Barriers (\u09AE\u09B9\u09BE\u0995\u09BE\u09B6\u099A\u09BE\u09B0\u09C0 \u09B0\u09BE\u0995\u09C7\u09B6 \u09B6\u09B0\u09CD\u09AE\u09BE \u0993 \u0995\u09B2\u09CD\u09AA\u09A8\u09BE \u099A\u09BE\u0993\u09B2\u09BE)", "\u0932\u0947\u0938\u0928 12: Beyond Barriers (\u0905\u0902\u0924\u0930\u093F\u0915\u094D\u0937 \u092F\u093E\u0924\u094D\u0930\u0940 \u0930\u093E\u0915\u0947\u0936 \u0936\u0930\u094D\u092E\u093E \u0914\u0930 \u0915\u0932\u094D\u092A\u0928\u093E \u091A\u093E\u0935\u0932\u093E)", ['Barun reading about Soyuz T-11, Rakesh Sharma ("Saare Jahan Se Achha"), Kalpana Chawla', "Conjunctions and question framing"], TB_ENG_5)
      ]
    },
    6: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_ENG_6,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Blossoms Class VI (Revision Lesson + Lessons 1\u201312)",
      boardNote: {
        en: "Official WBBSE Class VI Blossoms \u2014 Revision Lesson + All 12 Verified Lessons & Grammar.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF Blossoms \u2014 \u09B0\u09BF\u09AD\u09BF\u09B6\u09A8 \u09B2\u09C7\u09B8\u09A8 \u0993 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E8\u099F\u09BF \u09AA\u09BE\u09A0\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 6 Blossoms \u2014 \u0930\u093F\u0935\u0940\u091C\u0928 \u0932\u0947\u0938\u0928 \u0914\u0930 \u0938\u092D\u0940 12 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u092A\u093E\u0920\u0964"
      },
      chapters: [
        ch("e6_c0", 1, "Revision Lesson: Parts of Speech, Tenses, Gender & Number", "\u09B0\u09BF\u09AD\u09BF\u09B6\u09A8 \u09B2\u09C7\u09B8\u09A8: Parts of Speech, Tense \u0993 Number", "\u0930\u093F\u0935\u0940\u091C\u0928 \u0932\u0947\u0938\u0928: \u0936\u092C\u094D\u0926-\u092D\u0947\u0926, \u0915\u093E\u0932, \u0932\u093F\u0902\u0917 \u0914\u0930 \u0935\u091A\u0928", ["Nouns, pronouns, verbs, adjectives, adverbs, prepositions"], TB_ENG_6),
        ch("e6_c1", 2, "Lesson 1: It All Began With Drip-Drip (Alka Shankar & Sharleen Mukundan)", "\u09B2\u09C7\u09B8\u09A8 \u09E7: It All Began With Drip-Drip (\u09AD\u09CB\u09B2\u09BE\u09A8\u09BE\u09A5 \u0993 \u09AC\u09BE\u0998\u09C7\u09B0 \u0997\u09B2\u09CD\u09AA)", "\u0932\u0947\u0938\u0928 1: It All Began With Drip-Drip", ["Bholanath the potter, the tiger, and the leaking roof", "Countable and uncountable nouns, collective & abstract nouns"], TB_ENG_6),
        ch("e6_c2", 3, "Lesson 2: The Adventurous Clown (Enid Blyton)", "\u09B2\u09C7\u09B8\u09A8 \u09E8: The Adventurous Clown (Enid Blyton \u2014 Tuffy)", "\u0932\u0947\u0938\u0928 2: The Adventurous Clown (Enid Blyton)", ["Tuffy the toy clown and Timothy the puppy dog", "Simple and compound sentences"], TB_ENG_6),
        ch("e6_c3", 4, "Lesson 3: The Rainbow (Christina Georgina Rossetti)", "\u09B2\u09C7\u09B8\u09A8 \u09E9: The Rainbow (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 Christina Rossetti)", "\u0932\u0947\u0938\u0928 3: The Rainbow (\u0915\u0935\u093F\u0924\u093E \u2014 Christina Rossetti)", ["Boats, ships, clouds, bridges, and the rainbow bow from earth to sky", "Comparative and superlative adjectives"], TB_ENG_6),
        ch("e6_c4", 5, "Lesson 4: The Shop That Never Was (H.G. Wells)", "\u09B2\u09C7\u09B8\u09A8 \u09EA: The Shop That Never Was (H.G. Wells)", "\u0932\u0947\u0938\u0928 4: The Shop That Never Was (H.G. Wells)", ["Gip and the narrator in the Magic Shop in Regent Street", "Indefinite pronouns and kinds of sentences (Assertive, Interrogative, Imperative, Exclamatory)"], TB_ENG_6),
        ch("e6_c5", 6, "Lesson 5: Land of the Pharaohs (Ancient Egypt, Pyramids, Sphinx & Howard Carter)", "\u09B2\u09C7\u09B8\u09A8 \u09EB: Land of the Pharaohs (\u09AA\u09CD\u09B0\u09BE\u099A\u09C0\u09A8 \u09AE\u09BF\u09B6\u09B0 \u0993 \u09A4\u09C1\u09A4\u09BE\u09A8\u0996\u09BE\u09AE\u09C7\u09A8)", "\u0932\u0947\u0938\u0928 5: Land of the Pharaohs (\u092A\u094D\u0930\u093E\u091A\u0940\u0928 \u092E\u093F\u0938\u094D\u0930 \u0914\u0930 \u0924\u0942\u0924\u0928\u0916\u093E\u092E\u0947\u0928)", ["Ishan visit to Cairo, Giza pyramids, mummies, Howard Carter discovery of Tutankhamun tomb (1922)", "Subject-verb agreement & prefixes/suffixes"], TB_ENG_6),
        ch("e6_c6", 7, "Lesson 6: How the Little Kite Learned to Fly (Katherine Pyle)", "\u09B2\u09C7\u09B8\u09A8 \u09EC: How the Little Kite Learned to Fly (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 Katherine Pyle)", "\u0932\u0947\u0938\u0928 6: How the Little Kite Learned to Fly (\u0915\u0935\u093F\u0924\u093E)", ["Overcoming fear through perseverance", "Future tense & modal auxiliaries"], TB_ENG_6),
        ch("e6_c7", 8, "Lesson 7: The Magic Fish Bone (Charles Dickens)", "\u09B2\u09C7\u09B8\u09A8 \u09ED: The Magic Fish Bone (Charles Dickens)", "\u0932\u0947\u0938\u0928 7: The Magic Fish Bone (Charles Dickens)", ["King Watkins the First, Princess Alicia, and Fairy Grandmarina", "Affirmative and negative sentence transformation"], TB_ENG_6),
        ch("e6_c8", 9, "Lesson 8: Goodbye to the Moon (Monica Hughes)", "\u09B2\u09C7\u09B8\u09A8 \u09EE: Goodbye to the Moon (Monica Hughes)", "\u0932\u0947\u0938\u0928 8: Goodbye to the Moon (Monica Hughes)", ["Kepler Masterman born on the Moon traveling to Earth for the first time", "Prepositions and idioms"], TB_ENG_6),
        ch("e6_c9", 10, "Lesson 9: I Will Go With My Father A-Ploughing (Joseph Campbell)", "\u09B2\u09C7\u09B8\u09A8 \u09EF: I Will Go With My Father A-Ploughing (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 Joseph Campbell)", "\u0932\u0947\u0938\u0928 9: I Will Go With My Father A-Ploughing (\u0915\u0935\u093F\u0924\u093E)", ["Ploughing, sowing, and reaping in the green field with rooks, crows, and sea-gulls", "Present & Past Perfect Tense"], TB_ENG_6),
        ch("e6_c10", 11, "Lesson 10: Smart Ice Cream (Paul Jennings)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E6: Smart Ice Cream (Paul Jennings)", "\u0932\u0947\u0938\u0928 10: Smart Ice Cream (Paul Jennings)", ["Jerome Dadian, Mr. Peppi ice cream van, and the backfiring jealousy plot", "Linkers and adverbs"], TB_ENG_6),
        ch("e6_c11", 12, "Lesson 11: The Blind Boy (Colley Cibber)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E7: The Blind Boy (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 Colley Cibber)", "\u0932\u0947\u0938\u0928 11: The Blind Boy (\u0915\u0935\u093F\u0924\u093E \u2014 Colley Cibber)", ["The blind boy inner cheerfulness despite never seeing the sun", "Antonyms, synonyms, and homophones"], TB_ENG_6),
        ch("e6_c12", 13, "Lesson 12: Rip Van Winkle (Washington Irving)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E8: Rip Van Winkle (Washington Irving)", "\u0932\u0947\u0938\u0928 12: Rip Van Winkle (Washington Irving)", ["Rip Van Winkle in the Kaatskill Mountains sleeping for twenty years", "Direct and Indirect Speech intro & Story/Paragraph writing"], TB_ENG_6)
      ]
    },
    7: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_ENG_7,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Blossoms Class VII (Revision Lesson + Lessons 1\u201313)",
      boardNote: {
        en: "Official WBBSE Class VII Blossoms \u2014 Revision Lesson + All 13 Verified Lessons & Grammar.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF Blossoms \u2014 \u09B0\u09BF\u09AD\u09BF\u09B6\u09A8 \u09B2\u09C7\u09B8\u09A8 \u0993 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E9\u099F\u09BF \u09AA\u09BE\u09A0\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 7 Blossoms \u2014 \u0930\u093F\u0935\u0940\u091C\u0928 \u0932\u0947\u0938\u0928 \u0914\u0930 \u0938\u092D\u0940 13 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u092A\u093E\u0920\u0964"
      },
      chapters: [
        ch("e7_c0", 1, "Revision Lesson: Tenses, Articles, Prepositions & Degrees of Comparison", "\u09B0\u09BF\u09AD\u09BF\u09B6\u09A8 \u09B2\u09C7\u09B8\u09A8: Tense, Article, Preposition \u0993 Degree", "\u0930\u093F\u0935\u0940\u091C\u0928 \u0932\u0947\u0938\u0928: \u0915\u093E\u0932, \u0906\u0930\u094D\u091F\u093F\u0915\u0932, \u092A\u0942\u0930\u094D\u0935\u0938\u0930\u094D\u0917 \u0914\u0930 \u0935\u093F\u0936\u0947\u0937\u0923 \u0915\u0940 \u0905\u0935\u0938\u094D\u0925\u093E\u090F\u0901", ["Indefinite & definite articles", "Prepositions of time, place, direction", "Positive, comparative, superlative degrees"], TB_ENG_7),
        ch("e7_c1", 2, "Lesson 1: The Book of Nature (Jawaharlal Nehru)", "\u09B2\u09C7\u09B8\u09A8 \u09E7: The Book of Nature (\u099C\u0993\u09B9\u09B0\u09B2\u09BE\u09B2 \u09A8\u09C7\u09B9\u09B0\u09C1)", "\u0932\u0947\u0938\u0928 1: The Book of Nature (\u091C\u0935\u093E\u0939\u0930\u0932\u093E\u0932 \u0928\u0947\u0939\u0930\u0942)", ["Letters from a Father to His Daughter (Indira)", "Reading pebbles, fossils, and nature as pages of Earth history", "Possessive adjectives vs possessive pronouns"], TB_ENG_7),
        ch("e7_c2", 3, "Lesson 2: The Riddle (Akbar & Birbal)", "\u09B2\u09C7\u09B8\u09A8 \u09E8: The Riddle (\u0986\u0995\u09AC\u09B0 \u0993 \u09AC\u09C0\u09B0\u09AC\u09B2)", "\u0932\u0947\u0938\u0928 2: The Riddle (\u0905\u0915\u092C\u0930 \u0914\u0930 \u092C\u0940\u0930\u092C\u0932)", ["Emperor Akbar riddle of the fastest thing on earth (human mind) and the neighbour well dispute", "Adjectives of quality, quantity, and number"], TB_ENG_7),
        ch("e7_c3", 4, "Lesson 3: We Are Seven (William Wordsworth)", "\u09B2\u09C7\u09B8\u09A8 \u09E9: We Are Seven (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 William Wordsworth)", "\u0932\u0947\u0938\u0928 3: We Are Seven (\u0915\u0935\u093F\u0924\u093E \u2014 William Wordsworth)", ['The little cottage girl insisting "We are seven" including her siblings in the churchyard', "Poetic devices and rhyme scheme"], TB_ENG_7),
        ch("e7_c4", 5, "Lesson 4: The Beauty and the Beast (Madame Gabrielle-Suzanne Barbot de Villeneuve)", "\u09B2\u09C7\u09B8\u09A8 \u09EA: The Beauty and the Beast", "\u0932\u0947\u0938\u0928 4: The Beauty and the Beast", ["Belle selflessness and inner goodness breaking the Beast curse", "Present & Past Participle adjectives"], TB_ENG_7),
        ch("e7_c5", 6, "Lesson 5: Uncle Podger Hangs a Picture (Jerome K. Jerome)", "\u09B2\u09C7\u09B8\u09A8 \u09EB: Uncle Podger Hangs a Picture (Jerome K. Jerome)", "\u0932\u0947\u0938\u0928 5: Uncle Podger Hangs a Picture (Jerome K. Jerome)", ["Humorous excerpt from Three Men in a Boat", "Subject-verb agreement & prefixes/suffixes"], TB_ENG_7),
        ch("e7_c6", 7, "Lesson 6: The Vagabond (Robert Louis Stevenson)", "\u09B2\u09C7\u09B8\u09A8 \u09EC: The Vagabond (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 R.L. Stevenson)", "\u0932\u0947\u0938\u0928 6: The Vagabond (\u0915\u0935\u093F\u0924\u093E \u2014 R.L. Stevenson)", ["Love for the open road, nature, heaven above and road below", "Antonyms & synonyms"], TB_ENG_7),
        ch("e7_c7", 8, "Lesson 7: Mowgli Among the Wolves (Rudyard Kipling)", "\u09B2\u09C7\u09B8\u09A8 \u09ED: Mowgli Among the Wolves (Rudyard Kipling \u2014 The Jungle Book)", "\u0932\u0947\u0938\u0928 7: Mowgli Among the Wolves (Rudyard Kipling)", ["Father Wolf, Mother Wolf (Raksha), Akela, Baloo, Bagheera, and Shere Khan in the Seeonee hills", "Present & Past Perfect Continuous Tense"], TB_ENG_7),
        ch("e7_c8", 9, "Lesson 8: The Story of Proserpine (Roman Mythology \u2014 Ceres, Proserpine & Pluto)", "\u09B2\u09C7\u09B8\u09A8 \u09EE: The Story of Proserpine (\u09B0\u09CB\u09AE\u09BE\u09A8 \u09AA\u09C1\u09B0\u09BE\u09A3 \u2014 \u098B\u09A4\u09C1 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8\u09C7\u09B0 \u0995\u09BE\u09B9\u09BF\u09A8\u09BF)", "\u0932\u0947\u0938\u0928 8: The Story of Proserpine (\u0930\u094B\u092E\u0928 \u092A\u094C\u0930\u093E\u0923\u093F\u0915 \u0915\u0925\u093E)", ["Goddess Ceres, Pluto king of underworld, six pomegranate seeds, and origin of spring/winter seasons", "Modals (can, could, may, might, must, should)"], TB_ENG_7),
        ch("e7_c9", 10, "Lesson 9: J.C. Bose: A Beautiful Mind (Biography of Acharya Jagadish Chandra Bose)", "\u09B2\u09C7\u09B8\u09A8 \u09EF: J.C. Bose: A Beautiful Mind (\u0986\u099A\u09BE\u09B0\u09CD\u09AF \u099C\u0997\u09A6\u09C0\u09B6\u099A\u09A8\u09CD\u09A6\u09CD\u09B0 \u09AC\u09B8\u09C1)", "\u0932\u0947\u0938\u0928 9: J.C. Bose: A Beautiful Mind (\u0906\u091A\u093E\u0930\u094D\u092F \u091C\u0917\u0926\u0940\u0936 \u091A\u0902\u0926\u094D\u0930 \u092C\u0938\u0941)", ["Crescograph, wireless telegraphy demonstration (1895), Bose Institute, Abyakta", "Active and Passive Voice"], TB_ENG_7),
        ch("e7_c10", 11, "Lesson 10: The Echoing Green (William Blake)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E6: The Echoing Green (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 William Blake)", "\u0932\u0947\u0938\u0928 10: The Echoing Green (\u0915\u0935\u093F\u0924\u093E \u2014 William Blake)", ["Songs of Innocence: sunrise, children play, Old John under the oak, and sunset", "Nominal compounds and homonyms"], TB_ENG_7),
        ch("e7_c11", 12, "Lesson 11: The Axe (R.K. Narayan)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E7: The Axe (R.K. Narayan)", "\u0932\u0947\u0938\u0928 11: The Axe (R.K. Narayan)", ["Velan devotion to the Kumar Baugh garden and the margosa (neem) tree", "Direct and Indirect Speech (Narration)"], TB_ENG_7),
        ch("e7_c12", 13, "Lesson 12: My Diary (Anne Frank)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E8: My Diary (Anne Frank \u2014 The Diary of a Young Girl)", "\u0932\u0947\u0938\u0928 12: My Diary (\u0910\u0928\u0940 \u092B\u093C\u094D\u0930\u0948\u0902\u0915 \u0915\u0940 \u0921\u093E\u092F\u0930\u0940)", ["Anne Frank naming her diary Kitty, life in the Secret Annex in Amsterdam", "Idioms and clauses"], TB_ENG_7),
        ch("e7_c13", 14, "Lesson 13: Ghosts on the Verandah (Ruskin Bond)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E9: Ghosts on the Verandah (Ruskin Bond)", "\u0932\u0947\u0938\u0928 13: Ghosts on the Verandah (Ruskin Bond)", ["Anil and his mother Bibiji tales of jinns, munjia, and supernatural folklore", "Letter writing, Biography & Story writing"], TB_ENG_7)
      ]
    },
    8: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_ENG_8,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Blossoms Class VIII (Revision Lesson + Lessons 1\u201313)",
      boardNote: {
        en: "Official WBBSE Class VIII Blossoms \u2014 Revision Lesson + All 13 Verified Lessons & Grammar.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF Blossoms \u2014 \u09B0\u09BF\u09AD\u09BF\u09B6\u09A8 \u09B2\u09C7\u09B8\u09A8 \u0993 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E9\u099F\u09BF \u09AA\u09BE\u09A0\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 8 Blossoms \u2014 \u0930\u093F\u0935\u0940\u091C\u0928 \u0932\u0947\u0938\u0928 \u0914\u0930 \u0938\u092D\u0940 13 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u092A\u093E\u0920\u0964"
      },
      chapters: [
        ch("e8_c0", 1, "Revision Lesson: Tenses, Voice Change, Narration & Participles", "\u09B0\u09BF\u09AD\u09BF\u09B6\u09A8 \u09B2\u09C7\u09B8\u09A8: Tense, Voice \u0993 Narration \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8", "\u0930\u093F\u0935\u0940\u091C\u0928 \u0932\u0947\u0938\u0928: \u0915\u093E\u0932, \u0935\u093E\u091A\u094D\u092F \u0914\u0930 \u0915\u0925\u0928 \u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928", ["Comprehensive review of tenses, voice, and narration"], TB_ENG_8),
        ch("e8_c1", 2, "Lesson 1: The Wind Cap (Jane Yolen)", "\u09B2\u09C7\u09B8\u09A8 \u09E7: The Wind Cap (Jane Yolen \u2014 Jon & the Fairy Man)", "\u0932\u0947\u0938\u0928 1: The Wind Cap (Jane Yolen)", ["Jon the farmer son who longed to be a sailor and the striped wind cap", "Present & Past Perfect Continuous Tense"], TB_ENG_8),
        ch("e8_c2", 3, "Lesson 2: Clouds (Intizar Husain)", "\u09B2\u09C7\u09B8\u09A8 \u09E8: Clouds (Intizar Husain)", "\u0932\u0947\u0938\u0928 2: Clouds (\u0907\u0902\u0924\u093F\u091C\u093C\u093E\u0930 \u0939\u0941\u0938\u0948\u0928)", ["A boy quest seeking the clouds for rain in an arid village", "Future Continuous and Future Perfect Tense"], TB_ENG_8),
        ch("e8_c3", 4, "Lesson 3: An April Day (Henry Wadsworth Longfellow)", "\u09B2\u09C7\u09B8\u09A8 \u09E9: An April Day (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 H.W. Longfellow)", "\u0932\u0947\u0938\u0928 3: An April Day (\u0915\u0935\u093F\u0924\u093E \u2014 H.W. Longfellow)", ["Sweet April coming in, warm sun, sap, and woodland bird songs", "Infinitives, Participles, and Gerunds (Non-finite verbs)"], TB_ENG_8),
        ch("e8_c4", 5, "Lesson 4: The Great Escape (Sugata Bose)", "\u09B2\u09C7\u09B8\u09A8 \u09EA: The Great Escape (Sugata Bose \u2014 Netaji Subhas Chandra Bose & Sisir)", "\u0932\u0947\u0938\u0928 4: The Great Escape (\u0938\u0941\u0917\u0924 \u092C\u094B\u0938 \u2014 \u0928\u0947\u0924\u093E\u091C\u0940 \u0915\u093E \u092E\u0939\u093E\u0928 \u0928\u093F\u0937\u094D\u0915\u094D\u0930\u092E\u0923)", ["Subhas Chandra Bose historic escape from Elgin Road, Calcutta in the Wanderer car (January 1941) as Muhammad Ziauddin", "Phrases: Noun, Adjective, and Adverbial phrases"], TB_ENG_8),
        ch("e8_c5", 6, "Lesson 5: Princess September (W. Somerset Maugham)", "\u09B2\u09C7\u09B8\u09A8 \u09EB: Princess September (W. Somerset Maugham)", "\u0932\u0947\u0938\u0928 5: Princess September (W. Somerset Maugham)", ["Princess September, the little singing bird, and the value of freedom over a golden cage", "Clauses: Principal and Dependent (Noun, Adjective/Relative, Adverbial) clauses"], TB_ENG_8),
        ch("e8_c6", 7, "Lesson 6: The Sea (James Reeves)", "\u09B2\u09C7\u09B8\u09A8 \u09EC: The Sea (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 James Reeves)", "\u0932\u0947\u0938\u0928 6: The Sea (\u0915\u0935\u093F\u0924\u093E \u2014 James Reeves)", ["Extended metaphor comparing the sea to a hungry dog (giant grey dog)", "Poetic imagery & transformation of sentences"], TB_ENG_8),
        ch("e8_c7", 8, "Lesson 7: A King\u2019s Tale (Legend of King Arthur, Merlin & Excalibur)", "\u09B2\u09C7\u09B8\u09A8 \u09ED: A King\u2019s Tale (\u09B0\u09BE\u099C\u09BE \u0986\u09B0\u09CD\u09A5\u09BE\u09B0 \u0993 \u098F\u0995\u09CD\u09B8\u0995\u09CD\u09AF\u09BE\u09B2\u09BF\u09AC\u09BE\u09B0 \u09A4\u09B0\u09AC\u09BE\u09B0\u09BF)", "\u0932\u0947\u0938\u0928 7: A King\u2019s Tale (\u0930\u093E\u091C\u093E \u0906\u0930\u094D\u0925\u0930 \u0914\u0930 \u090F\u0915\u094D\u0938\u0915\u0948\u0932\u093F\u092C\u0930 \u0915\u0940 \u0915\u0925\u093E)", ["King Uther-Pendragon, Merlin the prophet, Sir Ector, Arthur pulling the sword from the stone, Round Table at Camelot", "Simple, Complex, and Compound sentences"], TB_ENG_8),
        ch("e8_c8", 9, "Lesson 8: The Happy Prince (Oscar Wilde)", "\u09B2\u09C7\u09B8\u09A8 \u09EE: The Happy Prince (Oscar Wilde \u2014 Drama Adaptation)", "\u0932\u0947\u0938\u0928 8: The Happy Prince (\u0911\u0938\u094D\u0915\u0930 \u0935\u093E\u0907\u0932\u094D\u0921)", ["The statue of the Happy Prince and the little Swallow helping the poor of the city", "Direct and Indirect Speech across all sentence types"], TB_ENG_8),
        ch("e8_c9", 10, "Lesson 9: Summer Friends (Mary Lamb)", "\u09B2\u09C7\u09B8\u09A8 \u09EF: Summer Friends (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 Mary Lamb)", "\u0932\u0947\u0938\u0928 9: Summer Friends (\u0915\u0935\u093F\u0924\u093E \u2014 Mary Lamb)", ["Contrast between the fair-weather swallow and the loyal winter sparrow", "Active and Passive Voice across tenses, imperatives & interrogatives"], TB_ENG_8),
        ch("e8_c10", 11, "Lesson 10: Tales of Childhood (Roald Dahl \u2014 Boy)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E6: Tales of Childhood (Roald Dahl)", "\u0932\u0947\u0938\u0928 10: Tales of Childhood (\u0930\u094B\u0906\u0932\u094D\u0921 \u0921\u093E\u0932)", ["Harald Dahl, Sofie Magdalene, Llandaff Cathedral School, and childhood memories", "Degrees of comparison & synthesis of sentences"], TB_ENG_8),
        ch("e8_c11", 12, "Lesson 11: Midnight Express (Alfred Noyes)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E7: Midnight Express (Alfred Noyes)", "\u0932\u0947\u0938\u0928 11: Midnight Express (\u0905\u0932\u094D\u092B\u093C\u094D\u0930\u0947\u0921 \u0928\u0949\u092F\u0947\u0938)", ["Mortimer and the mysterious leather-bound book The Midnight Express", "Idioms and Phrasal Verbs"], TB_ENG_8),
        ch("e8_c12", 13, "Lesson 12: Someone (Walter de la Mare)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E8: Someone (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 Walter de la Mare)", "\u0932\u0947\u0938\u0928 12: Someone (\u0915\u0935\u093F\u0924\u093E \u2014 Walter de la Mare)", ["Mysterious knocking at the wee, small door in the dark forest night (beetle, owl, cricket)", "Poetic appreciation"], TB_ENG_8),
        ch("e8_c13", 14, "Lesson 13: The Man Who Planted Trees (Jean Giono)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E9: The Man Who Planted Trees (Jean Giono \u2014 Elz\xE9ard Bouffier)", "\u0932\u0947\u0938\u0928 13: The Man Who Planted Trees (\u091C\u0940\u0928 \u091C\u093F\u092F\u094B\u0928\u094B)", ["Elz\xE9ard Bouffier single-handedly reforesting a barren valley in Provence with oak acorns", "Notice, Letter, Dialogue & Story Writing"], TB_ENG_8)
      ]
    },
    9: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_ENG_9,
      syllabusVersion: "WBBSE Secondary Curriculum (Current Edition)",
      officialSource: "WBBSE \u2014 Bliss Class IX (Lessons 1\u201312 + Grammar & Composition)",
      boardNote: {
        en: "Official WBBSE Class IX Bliss \u2014 All 12 Verified Lessons + Applied Grammar & Writing.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF Bliss \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E8\u099F\u09BF \u09AA\u09BE\u09A0 \u098F\u09AC\u0982 \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3 \u0993 \u09B0\u099A\u09A8\u09BE\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 9 Bliss \u2014 \u0938\u092D\u0940 12 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u092A\u093E\u0920 \u0924\u0925\u093E \u0935\u094D\u092F\u093E\u0915\u0930\u0923 \u0914\u0930 \u0932\u0947\u0916\u0928\u0964"
      },
      chapters: [
        ch("e9_c1", 1, "Lesson 1: Tales of Bhola Grandpa (Manoj Das)", "\u09B2\u09C7\u09B8\u09A8 \u09E7: Tales of Bhola Grandpa (\u09AE\u09A8\u09CB\u099C \u09A6\u09BE\u09B8)", "\u0932\u0947\u0938\u0928 1: Tales of Bhola Grandpa (\u092E\u0928\u094B\u091C \u0926\u093E\u0938)", ["Bhola Grandpa hilarious forgetfulness, the bokul tree, pirates, and the Royal Bengal Tiger in the Sundarbans", "Articles, Prepositions & Tenses"], TB_ENG_9),
        ch("e9_c2", 2, "Lesson 2: All About a Dog (A.G. Gardiner)", "\u09B2\u09C7\u09B8\u09A8 \u09E8: All About a Dog (A.G. Gardiner)", "\u0932\u0947\u0938\u0928 2: All About a Dog (\u090F.\u091C\u0940. \u0917\u093E\u0930\u094D\u0921\u093F\u0928\u0930)", ["The Pekingese dog on the bitter-cold London bus and the conductor rigid observance of rules vs spirit of the law", "Active and Passive Voice"], TB_ENG_9),
        ch("e9_c3", 3, "Lesson 3: Autumn (John Clare)", "\u09B2\u09C7\u09B8\u09A8 \u09E9: Autumn (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 John Clare)", "\u0932\u0947\u0938\u0928 3: Autumn (\u0915\u0935\u093F\u0924\u093E \u2014 John Clare)", ["Fitful gusts, faded leaves, mossy cottage-trees, sparrow, pigeons, and acorns in November countryside", "Synthesis of sentences (Simple, Complex, Compound)"], TB_ENG_9),
        ch("e9_c4", 4, "Lesson 4: A Day in the Zoo (Gerald Durrell)", "\u09B2\u09C7\u09B8\u09A8 \u09EA: A Day in the Zoo (Gerald Durrell)", "\u0932\u0947\u0938\u0928 4: A Day in the Zoo (\u091C\u0947\u0930\u093E\u0932\u094D\u0921 \u0921\u0930\u0947\u0932)", ["24 hours inside a private zoo: Touracos, Mike, Peacocks, Gorillas, Armadillos, and Etam the black Celebes ape", "Adverbial, Noun, and Relative Clauses"], TB_ENG_9),
        ch("e9_c5", 5, "Lesson 5: All Summer in a Day (Ray Bradbury)", "\u09B2\u09C7\u09B8\u09A8 \u09EB: All Summer in a Day (Ray Bradbury)", "\u0932\u0947\u0938\u0928 5: All Summer in a Day (\u0930\u0947 \u092C\u094D\u0930\u0948\u0921\u092C\u0930\u0940)", ["Nine-year-old schoolchildren on planet Venus where it rains for 7 years and the sun shines for only 1 hour", "Transformation: Affirmative/Negative, Interrogative, Exclamatory, Degrees"], TB_ENG_9),
        ch("e9_c6", 6, "Lesson 6: Mild the Mist Upon the Hill (Emily Bront\xEB)", "\u09B2\u09C7\u09B8\u09A8 \u09EC: Mild the Mist Upon the Hill (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 Emily Bront\xEB)", "\u0932\u0947\u0938\u0928 6: Mild the Mist Upon the Hill (\u0915\u0935\u093F\u0924\u093E \u2014 Emily Bront\xEB)", ["Nostalgia for youth and father sheltered roof evoked by blue mist and damp grass after a day of rain", "Phrasal Verbs (Group Verbs)"], TB_ENG_9),
        ch("e9_c7", 7, "Lesson 7: Tom Loses a Tooth (Mark Twain)", "\u09B2\u09C7\u09B8\u09A8 \u09ED: Tom Loses a Tooth (Mark Twain \u2014 The Adventures of Tom Sawyer)", "\u0932\u0947\u0938\u0928 7: Tom Loses a Tooth (\u092E\u093E\u0930\u094D\u0915 \u091F\u094D\u0935\u0947\u0928)", ["Tom Sawyer Monday morning excuses (sore toe, loose tooth), Sid, and Aunt Polly dental extraction with silk thread and fire chunk", "Direct and Indirect Narration"], TB_ENG_9),
        ch("e9_c8", 8, "Lesson 8: His First Flight (Liam O\u2019Flaherty)", "\u09B2\u09C7\u09B8\u09A8 \u09EE: His First Flight (Liam O\u2019Flaherty)", "\u0932\u0947\u0938\u0928 8: His First Flight (\u0932\u093F\u092F\u093E\u092E \u0913\u2019\u092B\u093C\u094D\u0932\u0948\u0939\u0930\u094D\u091F\u0940)", ["The young seagull overcoming his fear of flying across the vast green sea when tempted by a piece of fish", "Interchange of Parts of Speech (Noun, Verb, Adjective, Adverb forms)"], TB_ENG_9),
        ch("e9_c9", 9, "Lesson 9: The North Ship (Philip Larkin)", "\u09B2\u09C7\u09B8\u09A8 \u09EF: The North Ship (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 Philip Larkin)", "\u0932\u0947\u0938\u0928 9: The North Ship (\u0915\u0935\u093F\u0924\u093E \u2014 Philip Larkin)", ["Three ships sailing West, East, and North; the North ship rigged for a long journey under the unforgiving northern sky", "Joining and Splitting of sentences"], TB_ENG_9),
        ch("e9_c10", 10, "Lesson 10: The Price of Bananas (Mulk Raj Anand)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E6: The Price of Bananas (\u09AE\u09C1\u09B2\u0995 \u09B0\u09BE\u099C \u0986\u09A8\u09A8\u09CD\u09A6)", "\u0932\u0947\u0938\u0928 10: The Price of Bananas (\u092E\u0941\u0932\u094D\u0915 \u0930\u093E\u091C \u0906\u0928\u0902\u0926)", ["At Faizabad railway station: the monkey snatching the rich Sethji embroidered cap and the poor fruit vendor treatment", "Prepositions & Idiomatic expressions"], TB_ENG_9),
        ch("e9_c11", 11, "Lesson 11: A Shipwrecked Sailor (Daniel Defoe \u2014 Robinson Crusoe)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E7: A Shipwrecked Sailor (Daniel Defoe \u2014 \u09B0\u09AC\u09BF\u09A8\u09B8\u09A8 \u0995\u09CD\u09B0\u09C1\u09B8\u09CB)", "\u0932\u0947\u0938\u0928 11: A Shipwrecked Sailor (\u0921\u0948\u0928\u093F\u092F\u0932 \u0921\u093F\u092B\u093C\u094B \u2014 \u0930\u0949\u092C\u093F\u0928\u0938\u0928 \u0915\u094D\u0930\u0942\u0938\u094B)", ["Robinson Crusoe cast ashore on the Island of Despair (30 Sept 1659), salvaging supplies, building a tent, and keeping a notched calendar post", "Correction of Errors & Tense Consistency"], TB_ENG_9),
        ch("e9_c12", 12, "Lesson 12: Hunting Snake (Judith Wright)", "\u09B2\u09C7\u09B8\u09A8 \u09E7\u09E8: Hunting Snake (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 Judith Wright)", "\u0932\u0947\u0938\u0928 12: Hunting Snake (\u0915\u0935\u093F\u0924\u093E \u2014 Judith Wright)", ["Freezing in awe under the late autumn sky as a great black snake glides through the grass in quest of prey", "Newspaper Report, Formal/Informal Letter, Notice, Dialogue & Process Writing"], TB_ENG_9)
      ]
    },
    10: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_ENG_10,
      syllabusVersion: "WBBSE Madhyamik Pariksha Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Bliss Class X (Lessons 1\u20138 + Madhyamik Grammar & Writing)",
      boardNote: {
        en: "Official WBBSE Class X Bliss (Madhyamik Pariksha) \u2014 All 8 Verified Lessons + Grammar & Writing.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF Bliss (\u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995) \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09EE\u099F\u09BF \u09AA\u09BE\u09A0, \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3 \u0993 \u09B0\u099A\u09A8\u09BE\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 10 Bliss (\u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E) \u2014 \u0938\u092D\u0940 8 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u092A\u093E\u0920, \u0935\u094D\u092F\u093E\u0915\u0930\u0923 \u0914\u0930 \u0932\u0947\u0916\u0928\u0964"
      },
      chapters: [
        ch("e10_c1", 1, "Lesson 1: Father\u2019s Help (R.K. Narayan \u2014 Swami & Samuel)", "\u09B2\u09C7\u09B8\u09A8 \u09E7: Father\u2019s Help (R.K. Narayan)", "\u0932\u0947\u0938\u0928 1: Father\u2019s Help (\u0906\u0930.\u0915\u0947. \u0928\u093E\u0930\u093E\u092F\u0923)", ["Swaminathan Monday morning headache excuse, his father complaint letter to the headmaster, and his guilt toward his gentle teacher Samuel", "Tenses, Articles & Prepositions"], TB_ENG_10),
        ch("e10_c2", 2, "Lesson 2: Fable (Ralph Waldo Emerson \u2014 The Mountain and the Squirrel)", "\u09B2\u09C7\u09B8\u09A8 \u09E8: Fable (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 Ralph Waldo Emerson)", "\u0932\u0947\u0938\u0928 2: Fable (\u0915\u0935\u093F\u0924\u093E \u2014 \u0930\u093E\u0932\u094D\u092B\u093C \u0935\u093E\u0932\u094D\u0921\u094B \u0907\u092E\u0930\u094D\u0938\u0928)", ["Quarrel between the mountain and Bun (the squirrel): every creature and talent, great or small, has its rightful place in the universe", "Voice Change (Active & Passive across all forms)"], TB_ENG_10),
        ch("e10_c3", 3, "Lesson 3: The Passing Away of Bapu (Nayantara Sahgal)", "\u09B2\u09C7\u09B8\u09A8 \u09E9: The Passing Away of Bapu (\u09A8\u09AF\u09BC\u09A8\u09A4\u09BE\u09B0\u09BE \u09B8\u09BE\u09B9\u0997\u09B2)", "\u0932\u0947\u0938\u0928 3: The Passing Away of Bapu (\u0928\u092F\u0928\u0924\u093E\u0930\u093E \u0938\u0939\u0917\u0932)", ["30 January 1948 assassination of Mahatma Gandhi at Birla House, the funeral procession, the special train to Allahabad, and walking with Bapu in spirit", "Direct & Indirect Speech (Narration Change)"], TB_ENG_10),
        ch("e10_c4", 4, "Lesson 4: My Own True Family (Ted Hughes)", "\u09B2\u09C7\u09B8\u09A8 \u09EA: My Own True Family (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 Ted Hughes)", "\u0932\u0947\u0938\u0928 4: My Own True Family (\u0915\u0935\u093F\u0924\u093E \u2014 \u091F\u0947\u0921 \u0939\u094D\u092F\u0942\u091C\u0947\u0938)", ['Dream beneath the oakwood: the old woman cackle, the tribe of oak-trees ("We are chopped down, we are torn up"), and the boy heart becoming a tree', "Joining and Splitting into Simple, Complex & Compound Sentences"], TB_ENG_10),
        ch("e10_c5", 5, "Lesson 5: Our Runaway Kite (Lucy Maud Montgomery)", "\u09B2\u09C7\u09B8\u09A8 \u09EB: Our Runaway Kite (Lucy Maud Montgomery)", "\u0932\u0947\u0938\u0928 5: Our Runaway Kite (\u0932\u0942\u0938\u0940 \u092E\u0949\u0921 \u092E\u094B\u0902\u091F\u0917\u094B\u092E\u0930\u0940)", ["Philippa, Claude, and their Father (lighthouse keeper on Big Half Moon Island) reuniting with Aunt Esther, Dick, and Mimi through a patched red kite", "Clauses (Nominal, Relative/Adjectival, Adverbial)"], TB_ENG_10),
        ch("e10_c6", 6, "Lesson 6: Sea Fever (John Masefield)", "\u09B2\u09C7\u09B8\u09A8 \u09EC: Sea Fever (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 John Masefield)", "\u0932\u0947\u0938\u0928 6: Sea Fever (\u0915\u0935\u093F\u0924\u093E \u2014 \u091C\u0949\u0928 \u092E\u0947\u0938\u092B\u093C\u0940\u0932\u094D\u0921)", ['"I must go down to the seas again", tall ship, star to steer her by, call of the running tide, vagrant gypsy life, and quiet sleep after the long trick', "Transformation of Sentences (Degrees, Affirmative/Negative, Parts of Speech)"], TB_ENG_10),
        ch("e10_c7", 7, "Lesson 7: The Cat (Andrew Barton Paterson)", "\u09B2\u09C7\u09B8\u09A8 \u09ED: The Cat (Andrew Barton Paterson)", "\u0932\u0947\u0938\u0928 7: The Cat (\u090F\u0902\u0921\u094D\u0930\u092F\u0942 \u092C\u093E\u0930\u094D\u091F\u0928 \u092A\u0948\u091F\u0930\u0938\u0928)", ["The dual character of the domestic cat: purring by the tea-table by day vs grim fighter and suburban prowler on rooftops at night", "Phrasal Verbs (Group Verbs) & Vocabulary in Context"], TB_ENG_10),
        ch("e10_c8", 8, "Lesson 8: The Snail (William Cowper)", "\u09B2\u09C7\u09B8\u09A8 \u09EE: The Snail (\u0995\u09AC\u09BF\u09A4\u09BE \u2014 William Cowper)", "\u0932\u0947\u0938\u0928 8: The Snail (\u0915\u0935\u093F\u0924\u093E \u2014 \u0935\u093F\u0932\u093F\u092F\u092E \u0915\u0942\u092A\u0930)", ["Self-reliant life of the snail sticking close to grass, leaf, fruit, or wall, shrinking into his house at the slightest touch of his horns", "Madhyamik Writing Skills: Newspaper Report, Notice, Editorial/Personal Letter, Biography, Process & Story Writing"], TB_ENG_10)
      ]
    }
  }
};
var BANGLA_SUBJECT = {
  id: "bangla",
  name: {
    en: "Bangla (Bengali)",
    bn: "\u09AC\u09BE\u0982\u09B2\u09BE (Bangla)",
    hi: "\u092C\u093E\u0902\u0917\u094D\u0932\u093E (Bangla)"
  },
  shortDesc: {
    en: "Bengali literature, poetry, prose, supplementary readers, and Bengali grammar (Byakaran) from official Patabahar, Sahitya Mela & Sahitya Sanchayan.",
    bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AA\u09B0\u09CD\u09B7\u09A6\u09C7\u09B0 \u09AA\u09BE\u09A4\u09BE\u09AC\u09BE\u09B9\u09BE\u09B0, \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u0993 \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995\u09C7\u09B0 \u0997\u09A6\u09CD\u09AF, \u09AA\u09A6\u09CD\u09AF, \u09B8\u09B9\u09BE\u09AF\u09BC\u0995 \u09AA\u09BE\u09A0 \u098F\u09AC\u0982 \u09AC\u09BE\u0982\u09B2\u09BE \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3 \u0993 \u09A8\u09BF\u09B0\u09CD\u09AE\u09BF\u09A4\u09BF\u0964",
    hi: "\u092A\u0936\u094D\u091A\u093F\u092E \u092C\u0902\u0917\u093E\u0932 \u092C\u094B\u0930\u094D\u0921 \u0915\u0940 \u092A\u093E\u0924\u093E\u092C\u093E\u0939\u093E\u0930, \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E \u0914\u0930 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915\u094B\u0902 \u0938\u0947 \u092C\u093E\u0902\u0917\u094D\u0932\u093E \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0914\u0930 \u0935\u094D\u092F\u093E\u0915\u0930\u0923\u0964"
  },
  domainGuardKeywords: [
    "\u09AC\u09BE\u0982\u09B2\u09BE",
    "\u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3",
    "\u09B8\u09A8\u09CD\u09A7\u09BF",
    "\u09B8\u09AE\u09BE\u09B8",
    "\u0995\u09BE\u09B0\u0995",
    "\u09AC\u09BF\u09AD\u0995\u09CD\u09A4\u09BF",
    "\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09AF\u09BC",
    "\u09AC\u09BE\u099A\u09CD\u09AF",
    "\u09AC\u09BE\u0995\u09CD\u09AF",
    "\u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5",
    "\u09A8\u099C\u09B0\u09C1\u09B2",
    "\u09B8\u09C1\u0995\u09C1\u09AE\u09BE\u09B0",
    "\u09B6\u09B0\u09CE\u099A\u09A8\u09CD\u09A6\u09CD\u09B0",
    "\u09B8\u09A4\u09CD\u09AF\u099C\u09BF\u09CE",
    "\u0995\u09AC\u09BF\u09A4\u09BE",
    "\u0997\u09B2\u09CD\u09AA"
  ],
  curriculumByClass: {
    5: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_BN_5,
      syllabusVersion: "WBBPE Primary Syllabus (Current Edition)",
      officialSource: "WBBPE \u2014 Patabahar & Bhashapallab Class V",
      boardNote: {
        en: "Official WBBPE Class V Patabahar & Bhashapallab \u2014 All 12 Verified Literature & Grammar Units.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBPE) \u09AA\u099E\u09CD\u099A\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u09AA\u09BE\u09A4\u09BE\u09AC\u09BE\u09B9\u09BE\u09B0 \u0993 \u09AD\u09BE\u09B7\u09BE\u09AA\u09B2\u09CD\u09B2\u09AC \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E8\u099F\u09BF \u09AA\u09BE\u09A0 \u0993 \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3\u0964",
        hi: "WBBPE \u0915\u0915\u094D\u0937\u093E 5 \u092A\u093E\u0924\u093E\u092C\u093E\u0939\u093E\u0930 \u0914\u0930 \u092D\u093E\u0937\u093E\u092A\u0932\u094D\u0932\u0935 \u2014 \u0938\u092D\u0940 12 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u090F\u0935\u0902 \u0935\u094D\u092F\u093E\u0915\u0930\u0923 \u0907\u0915\u093E\u0907\u092F\u093E\u0901\u0964"
      },
      chapters: [
        ch("bn5_c1", 1, "Patabahar 1: Galpoburo (Sunirmal Basu) & Buno Hans (Leela Majumdar)", "\u09AA\u09BE\u09A4\u09BE\u09AC\u09BE\u09B9\u09BE\u09B0 \u09E7: \u0997\u09B2\u09CD\u09AA\u09AC\u09C1\u09A1\u09BC\u09CB (\u09B8\u09C1\u09A8\u09BF\u09B0\u09CD\u09AE\u09B2 \u09AC\u09B8\u09C1) \u0993 \u09AC\u09C1\u09A8\u09CB \u09B9\u09BE\u0981\u09B8 (\u09B2\u09C0\u09B2\u09BE \u09AE\u099C\u09C1\u09AE\u09A6\u09BE\u09B0)", "\u092A\u093E\u0924\u093E\u092C\u093E\u0939\u093E\u0930 1: \u0917\u0932\u094D\u092A\u092C\u0941\u0930\u094B (\u0938\u0941\u0928\u093F\u0930\u094D\u092E\u0932 \u092C\u0938\u0941) \u0914\u0930 \u092C\u0941\u0928\u094B \u0939\u093E\u0902\u0938 (\u0932\u0940\u0932\u093E \u092E\u091C\u0942\u092E\u0926\u093E\u0930)", ["\u0997\u09B2\u09CD\u09AA\u09AC\u09C1\u09A1\u09BC\u09CB\u09B0 \u099D\u09CB\u09B2\u09BE \u0993 \u09B0\u09C2\u09AA\u0995\u09A5\u09BE", "\u09B2\u09BE\u09A6\u09BE\u0996\u09C7\u09B0 \u09AC\u09B0\u09AB\u09C7 \u0986\u09B9\u09A4 \u09AC\u09C1\u09A8\u09CB \u09B9\u09BE\u0981\u09B8\u09C7\u09B0 \u09B8\u09C7\u09AC\u09BE \u0993 \u09AA\u09B0\u09BF\u09AF\u09BE\u09AF\u09BC\u09C0 \u09AA\u09BE\u0996\u09BF"], TB_BN_5),
        ch("bn5_c2", 2, "Patabahar 2: Darogar Daptar (Priyanath Mukhopadhyay) & Etooyar Munda\u2019r Kahini (Mahasweta Devi)", "\u09AA\u09BE\u09A4\u09BE\u09AC\u09BE\u09B9\u09BE\u09B0 \u09E8: \u09A6\u09BE\u09B0\u09CB\u0997\u09BE\u09B0 \u09A6\u09AA\u09CD\u09A4\u09B0 (\u09AA\u09CD\u09B0\u09BF\u09AF\u09BC\u09A8\u09BE\u09A5 \u09AE\u09C1\u0996\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC) \u0993 \u098F\u09A4\u09CB\u09AF\u09BC\u09BE \u09AE\u09C1\u09A8\u09CD\u09A1\u09BE\u09B0 \u0995\u09BE\u09B9\u09BF\u09A8\u09BF (\u09AE\u09B9\u09BE\u09B6\u09CD\u09AC\u09C7\u09A4\u09BE \u09A6\u09C7\u09AC\u09C0)", "\u092A\u093E\u0924\u093E\u092C\u093E\u0939\u093E\u0930 2: \u0926\u093E\u0930\u094B\u0917\u093E\u0930 \u0926\u092A\u094D\u0924\u0930 \u0914\u0930 \u090F\u0924\u094B\u092F\u093E \u092E\u0941\u0902\u0921\u093E \u0915\u0940 \u0915\u0939\u093E\u0928\u0940 (\u092E\u0939\u093E\u0936\u094D\u0935\u0947\u0924\u093E \u0926\u0947\u0935\u0940)", ["\u099A\u09C1\u09B0\u09BF\u09B0 \u0995\u09BF\u09A8\u09BE\u09B0\u09BE \u0993 \u09AC\u09C1\u09A6\u09CD\u09A7\u09BF\u09A6\u09C0\u09AA\u09CD\u09A4 \u0985\u09A8\u09C1\u09B8\u09A8\u09CD\u09A7\u09BE\u09A8", "\u09B8\u09C1\u09AC\u09B0\u09CD\u09A3\u09B0\u09C7\u0996\u09BE \u09A8\u09A6\u09C0, \u0986\u09A6\u09BF\u09AC\u09BE\u09B8\u09C0 \u099C\u09C0\u09AC\u09A8 \u0993 \u098F\u09A4\u09CB\u09AF\u09BC\u09BE \u09AE\u09C1\u09A8\u09CD\u09A1\u09BE"], TB_BN_5),
        ch("bn5_c3", 3, "Patabahar 3: Pakhir Kache Phuler Kache (Al Mahmud) & Bimlar Abhiman (Navakanta Chattopadhyay)", "\u09AA\u09BE\u09A4\u09BE\u09AC\u09BE\u09B9\u09BE\u09B0 \u09E9: \u09AA\u09BE\u0996\u09BF\u09B0 \u0995\u09BE\u099B\u09C7 \u09AB\u09C1\u09B2\u09C7\u09B0 \u0995\u09BE\u099B\u09C7 (\u0986\u09B2 \u09AE\u09BE\u09B9\u09AE\u09C1\u09A6) \u0993 \u09AC\u09BF\u09AE\u09B2\u09BE\u09B0 \u0985\u09AD\u09BF\u09AE\u09BE\u09A8 (\u09A8\u09AC\u0995\u09C3\u09B7\u09CD\u09A3 \u09AD\u099F\u09CD\u099F\u09BE\u099A\u09BE\u09B0\u09CD\u09AF)", "\u092A\u093E\u0924\u093E\u092C\u093E\u0939\u093E\u0930 3: \u092A\u093E\u0916\u093F\u0930 \u0915\u093E\u091B\u0947 \u092B\u0941\u0932\u0947\u0930 \u0915\u093E\u091B\u0947 \u0914\u0930 \u0935\u093F\u092E\u0932\u093E\u0930 \u0905\u092D\u093F\u092E\u093E\u0928", ["\u09A8\u09BF\u09B8\u09B0\u09CD\u0997\u09AA\u09CD\u09B0\u09C7\u09AE \u0993 \u09A1\u09BE\u09AC\u09C7\u09B0 \u09AE\u09A4\u09CB \u099A\u09BE\u0981\u09A6", "\u099B\u09CB\u099F\u09CD\u099F \u09AC\u09BF\u09AE\u09B2\u09BE\u09B0 \u0995\u09BE\u099C\u09C7\u09B0 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u0993 \u0985\u09AD\u09BF\u09AE\u09BE\u09A8"], TB_BN_5),
        ch("bn5_c4", 4, "Patabahar 4: Chhelebela (Rabindranath Tagore) & Mathurapur/Mayradanga Tales", "\u09AA\u09BE\u09A4\u09BE\u09AC\u09BE\u09B9\u09BE\u09B0 \u09EA: \u099B\u09C7\u09B2\u09C7\u09AC\u09C7\u09B2\u09BE (\u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u09A0\u09BE\u0995\u09C1\u09B0) \u0993 \u09AE\u09BE\u09A0 \u09AE\u09BE\u09A8\u09C7 \u099B\u09C1\u099F (\u0995\u09BE\u09B0\u09CD\u09A4\u09BF\u0995 \u0998\u09CB\u09B7)", "\u092A\u093E\u0924\u093E\u092C\u093E\u0939\u093E\u0930 4: \u091B\u0947\u0932\u0947\u092C\u0947\u0932\u093E (\u0930\u0935\u0940\u0902\u0926\u094D\u0930\u0928\u093E\u0925 \u091F\u0948\u0917\u094B\u0930) \u0914\u0930 \u092E\u093E\u0920 \u092E\u093E\u0928\u0947 \u091B\u0941\u091F", ["\u09AC\u09BE\u09B2\u0995 \u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5\u09C7\u09B0 \u099B\u09BE\u09A6\u09C7\u09B0 \u09B8\u09CD\u09AE\u09C3\u09A4\u09BF \u0993 \u09AC\u09C3\u09B7\u09CD\u099F\u09BF", "\u09B6\u09C8\u09B6\u09AC\u09C7\u09B0 \u09A6\u09C1\u09B0\u09A8\u09CD\u09A4\u09AA\u09A8\u09BE \u0993 \u0996\u09C7\u09B2\u09BE\u09B0 \u09AE\u09BE\u09A0"], TB_BN_5),
        ch("bn5_c5", 5, "Patabahar 5: Limericks (Edward Lear / Satyajit Ray) & Jhancir Rani", "\u09AA\u09BE\u09A4\u09BE\u09AC\u09BE\u09B9\u09BE\u09B0 \u09EB: \u09B2\u09BF\u09AE\u09C7\u09B0\u09BF\u0995 (\u09B8\u09A4\u09CD\u09AF\u099C\u09BF\u09CE \u09B0\u09BE\u09AF\u09BC \u0985\u09A8\u09C2\u09A6\u09BF\u09A4) \u0993 \u09AA\u09BE\u09B9\u09BE\u09A1\u09BC\u09BF\u09AF\u09BC\u09BE \u09AC\u09B0\u09CD\u09B7\u09BE\u09B0 \u09B8\u09C1\u09B0", "\u092A\u093E\u0924\u093E\u092C\u093E\u0939\u093E\u0930 5: \u0932\u093F\u092E\u0930\u093F\u0915 (\u0938\u0924\u094D\u092F\u091C\u0940\u0924 \u0930\u093E\u092F) \u0914\u0930 \u092A\u0939\u093E\u0921\u093C\u093F\u092F\u093E \u0935\u0930\u094D\u0937\u093E\u0930 \u0938\u0941\u0930", ["\u09B2\u09BF\u09AE\u09C7\u09B0\u09BF\u0995\u09C7\u09B0 \u099B\u09A8\u09CD\u09A6 \u0993 \u0995\u09CC\u09A4\u09C1\u0995", "\u099C\u09B2\u09AA\u09BE\u0987\u0997\u09C1\u09A1\u09BC\u09BF \u0993 \u09B9\u09BF\u09AE\u09BE\u09B2\u09AF\u09BC\u09C7\u09B0 \u09AA\u09CD\u09B0\u0995\u09C3\u09A4\u09BF"], TB_BN_5),
        ch("bn5_c6", 6, "Patabahar 6: \u09AC\u09CB\u0995\u09BE \u0995\u09C1\u09AE\u09BF\u09B0\u09C7\u09B0 \u0995\u09A5\u09BE (Upendrakishore Raychaudhuri) & \u09AE\u09BE\u09B8\u09CD\u099F\u09BE\u09B0\u09A6\u09BE (Ashokkumar Mukhopadhyay)", "\u09AA\u09BE\u09A4\u09BE\u09AC\u09BE\u09B9\u09BE\u09B0 \u09EC: \u09AC\u09CB\u0995\u09BE \u0995\u09C1\u09AE\u09BF\u09B0\u09C7\u09B0 \u0995\u09A5\u09BE (\u0989\u09AA\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0\u0995\u09BF\u09B6\u09CB\u09B0 \u09B0\u09BE\u09AF\u09BC\u099A\u09CC\u09A7\u09C1\u09B0\u09C0) \u0993 \u09AE\u09BE\u09B8\u09CD\u099F\u09BE\u09B0\u09A6\u09BE (\u0985\u09B6\u09CB\u0995\u0995\u09C1\u09AE\u09BE\u09B0 \u09AE\u09C1\u0996\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC)", "\u092A\u093E\u0924\u093E\u092C\u093E\u0939\u093E\u0930 6: \u092C\u094B\u0915\u093E \u0915\u0941\u092E\u093F\u0930\u0947\u0930 \u0915\u0925\u093E (\u0909\u092A\u0947\u0928\u094D\u0926\u094D\u0930\u0915\u093F\u0936\u094B\u0930 \u0930\u093E\u092F\u091A\u094C\u0927\u0941\u0930\u0940) \u0914\u0930 \u092E\u093E\u0938\u094D\u091F\u0930\u0926\u093E (\u0938\u0942\u0930\u094D\u092F \u0938\u0947\u0928)", ["\u09B6\u09BF\u09AF\u09BC\u09BE\u09B2 \u0993 \u0995\u09C1\u09AE\u09BF\u09B0\u09C7\u09B0 \u099A\u09BE\u09B7\u09C7\u09B0 \u0997\u09B2\u09CD\u09AA (\u0986\u09B2\u09C1, \u09A7\u09BE\u09A8, \u0986\u0996)", "\u099A\u099F\u09CD\u099F\u0997\u09CD\u09B0\u09BE\u09AE \u0985\u09B8\u09CD\u09A4\u09CD\u09B0\u09BE\u0997\u09BE\u09B0 \u09B2\u09C1\u09A3\u09CD\u09A0\u09A8 \u0993 \u09AE\u09BE\u09B8\u09CD\u099F\u09BE\u09B0\u09A6\u09BE \u09B8\u09C2\u09B0\u09CD\u09AF \u09B8\u09C7\u09A8"], TB_BN_5),
        ch("bn5_c7", 7, "Patabahar 7: \u09AE\u09BF\u09B7\u09CD\u099F\u09BF (Premendra Mitra \u2014 Ghanada) & \u09A4\u09BE\u09B2\u09A8\u09AC\u09AE\u09C0 (Bibhutibhushan Bandyopadhyay)", "\u09AA\u09BE\u09A4\u09BE\u09AC\u09BE\u09B9\u09BE\u09B0 \u09ED: \u09AE\u09BF\u09B7\u09CD\u099F\u09BF (\u09AA\u09CD\u09B0\u09C7\u09AE\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0 \u09AE\u09BF\u09A4\u09CD\u09B0) \u0993 \u09A4\u09BE\u09B2\u09A8\u09AC\u09AE\u09C0 (\u09AC\u09BF\u09AD\u09C2\u09A4\u09BF\u09AD\u09C2\u09B7\u09A3 \u09AC\u09A8\u09CD\u09A6\u09CD\u09AF\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC)", "\u092A\u093E\u0924\u093E\u092C\u093E\u0939\u093E\u0930 7: \u092E\u093F\u0937\u094D\u091F\u093F (\u092A\u094D\u0930\u0947\u092E\u0947\u0902\u0926\u094D\u0930 \u092E\u093F\u0924\u094D\u0930) \u0914\u0930 \u0924\u093E\u0932\u0928\u0935\u092E\u0940 (\u0935\u093F\u092D\u0942\u0924\u093F\u092D\u0942\u0937\u0923 \u092C\u0902\u0926\u094D\u092F\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F)", ["\u0998\u09A8\u09BE\u09A6\u09BE\u09B0 \u0997\u09B2\u09CD\u09AA", "\u09A8\u09C7\u09AA\u09BE\u09B2 \u0993 \u0997\u09CB\u09AA\u09BE\u09B2\u09C7\u09B0 \u09A4\u09BE\u09B2 \u0995\u09C1\u09A1\u09BC\u09BE\u09A8\u09CB \u098F\u09AC\u0982 \u099C\u099F\u09BF \u09AA\u09BF\u09B8\u09BF\u09AE\u09BE\u09B0 \u09A4\u09BE\u09B2\u09A8\u09AC\u09AE\u09C0\u09B0 \u09AC\u09CD\u09B0\u09A4"], TB_BN_5),
        ch("bn5_c8", 8, "Patabahar 8: \u098F\u0995\u09B2\u09BE (Shankha Ghosh), \u0986\u0995\u09BE\u09B6\u09C7\u09B0 \u09A6\u09C1\u0987 \u09AC\u09A8\u09CD\u09A7\u09C1 (Shailen Ghosh) & \u09AB\u09A3\u09BF\u09AE\u09A8\u09B8\u09BE \u0993 \u09AC\u09A8\u09C7\u09B0 \u09AA\u09B0\u09BF (Biru Mukhopadhyay)", "\u09AA\u09BE\u09A4\u09BE\u09AC\u09BE\u09B9\u09BE\u09B0 \u09EE: \u098F\u0995\u09B2\u09BE (\u09B6\u0999\u09CD\u0996 \u0998\u09CB\u09B7), \u0986\u0995\u09BE\u09B6\u09C7\u09B0 \u09A6\u09C1\u0987 \u09AC\u09A8\u09CD\u09A7\u09C1 \u0993 \u09AB\u09A3\u09BF\u09AE\u09A8\u09B8\u09BE \u0993 \u09AC\u09A8\u09C7\u09B0 \u09AA\u09B0\u09BF", "\u092A\u093E\u0924\u093E\u092C\u093E\u0939\u093E\u0930 8: \u090F\u0915\u0932\u093E (\u0936\u0902\u0916 \u0918\u094B\u0937), \u0906\u0915\u093E\u0936\u0947\u0930 \u0926\u0941\u0908 \u092C\u0902\u0927\u0941 \u0914\u0930 \u092B\u0923\u093F\u092E\u0928\u0938\u093E \u0913 \u092C\u0928\u0947\u0930 \u092A\u0930\u0940", ["\u09B8\u09CB\u09A8\u09BE\u09B0 \u09AA\u09BE\u09A4\u09BE, \u0995\u09BE\u099A\u09C7\u09B0 \u09AA\u09BE\u09A4\u09BE, \u09AA\u09BE\u09B2\u0982 \u09B6\u09BE\u0995\u09C7\u09B0 \u09AA\u09BE\u09A4\u09BE \u0993 \u09A8\u09BF\u099C\u09C7\u09B0 \u0995\u09BE\u0981\u099F\u09BE\u09AA\u09BE\u09A4\u09BE\u09AF\u09BC \u09AB\u09A3\u09BF\u09AE\u09A8\u09B8\u09BE\u09B0 \u09B8\u09A8\u09CD\u09A4\u09C1\u09B7\u09CD\u099F\u09BF"], TB_BN_5),
        ch("bn5_c9", 9, "Bhashapallab 1: \u09A7\u09CD\u09AC\u09A8\u09BF, \u09AC\u09B0\u09CD\u09A3, \u09B8\u09CD\u09AC\u09B0\u09B8\u09A8\u09CD\u09A7\u09BF \u0993 \u09B6\u09AC\u09CD\u09A6\u09BE\u09B0\u09CD\u09A5", "\u09AD\u09BE\u09B7\u09BE\u09AA\u09B2\u09CD\u09B2\u09AC \u09E7: \u09A7\u09CD\u09AC\u09A8\u09BF, \u09AC\u09B0\u09CD\u09A3 \u0993 \u09B8\u09CD\u09AC\u09B0\u09B8\u09A8\u09CD\u09A7\u09BF", "\u092D\u093E\u0937\u093E\u092A\u0932\u094D\u0932\u0935 1: \u0927\u094D\u0935\u0928\u093F, \u0935\u0930\u094D\u0923 \u0914\u0930 \u0938\u094D\u0935\u0930 \u0938\u0902\u0927\u093F", ["\u09B8\u09CD\u09AC\u09B0\u09AC\u09B0\u09CD\u09A3 \u0993 \u09AC\u09CD\u09AF\u099E\u09CD\u099C\u09A8\u09AC\u09B0\u09CD\u09A3, \u09AC\u09B0\u09CD\u09A3\u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3, \u09B8\u09CD\u09AC\u09B0\u09B8\u09A8\u09CD\u09A7\u09BF\u09B0 \u09B8\u09C2\u09A4\u09CD\u09B0 \u0993 \u0989\u09A6\u09BE\u09B9\u09B0\u09A3"], TB_BN_5),
        ch("bn5_c10", 10, "Bhashapallab 2: \u09AA\u09A6 \u09AA\u09B0\u09BF\u099A\u09AF\u09BC (\u09AC\u09BF\u09B6\u09C7\u09B7\u09CD\u09AF, \u09B8\u09B0\u09CD\u09AC\u09A8\u09BE\u09AE, \u09AC\u09BF\u09B6\u09C7\u09B7\u09A3, \u0985\u09AC\u09CD\u09AF\u09AF\u09BC \u0993 \u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE)", "\u09AD\u09BE\u09B7\u09BE\u09AA\u09B2\u09CD\u09B2\u09AC \u09E8: \u09AA\u09A6 \u09AA\u09B0\u09BF\u099A\u09AF\u09BC (\u09AA\u09BE\u0981\u099A \u09AA\u09CD\u09B0\u0995\u09BE\u09B0 \u09AA\u09A6)", "\u092D\u093E\u0937\u093E\u092A\u0932\u094D\u0932\u0935 2: \u092A\u0926 \u092A\u0930\u093F\u091A\u092F (\u0938\u0902\u091C\u094D\u091E\u093E, \u0938\u0930\u094D\u0935\u0928\u093E\u092E, \u0935\u093F\u0936\u0947\u0937\u0923, \u0905\u0935\u094D\u092F\u092F \u0914\u0930 \u0915\u094D\u0930\u093F\u092F\u093E)", ["\u09AC\u09BF\u09B6\u09C7\u09B7\u09CD\u09AF, \u09B8\u09B0\u09CD\u09AC\u09A8\u09BE\u09AE, \u09AC\u09BF\u09B6\u09C7\u09B7\u09A3, \u0985\u09AC\u09CD\u09AF\u09AF\u09BC \u0993 \u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u09AA\u09A6\u09C7\u09B0 \u099A\u09BF\u09B9\u09CD\u09A8\u09BF\u09A4\u0995\u09B0\u09A3"], TB_BN_5),
        ch("bn5_c11", 11, "Bhashapallab 3: \u09B2\u09BF\u0999\u09CD\u0997, \u09AC\u099A\u09A8 \u0993 \u09AA\u09C1\u09B0\u09C1\u09B7", "\u09AD\u09BE\u09B7\u09BE\u09AA\u09B2\u09CD\u09B2\u09AC \u09E9: \u09B2\u09BF\u0999\u09CD\u0997, \u09AC\u099A\u09A8 \u0993 \u09AA\u09C1\u09B0\u09C1\u09B7", "\u092D\u093E\u0937\u093E\u092A\u0932\u094D\u0932\u0935 3: \u0932\u093F\u0902\u0917, \u0935\u091A\u0928 \u0914\u0930 \u092A\u0941\u0930\u0941\u0937", ["\u09AA\u09C1\u0982\u09B2\u09BF\u0999\u09CD\u0997, \u09B8\u09CD\u09A4\u09CD\u09B0\u09C0\u09B2\u09BF\u0999\u09CD\u0997, \u0995\u09CD\u09B2\u09C0\u09AC\u09B2\u09BF\u0999\u09CD\u0997, \u0989\u09AD\u09AF\u09BC\u09B2\u09BF\u0999\u09CD\u0997; \u098F\u0995\u09AC\u099A\u09A8 \u0993 \u09AC\u09B9\u09C1\u09AC\u099A\u09A8; \u0989\u09A4\u09CD\u09A4\u09AE, \u09AE\u09A7\u09CD\u09AF\u09AE \u0993 \u09AA\u09CD\u09B0\u09A5\u09AE \u09AA\u09C1\u09B0\u09C1\u09B7"], TB_BN_5),
        ch("bn5_c12", 12, "Bhashapallab 4: \u09B8\u09AE\u09BE\u09B0\u09CD\u09A5\u0995 \u09B6\u09AC\u09CD\u09A6, \u09AC\u09BF\u09AA\u09B0\u09C0\u09A4\u09BE\u09B0\u09CD\u09A5\u0995 \u09B6\u09AC\u09CD\u09A6, \u098F\u0995\u0995\u09A5\u09BE\u09AF\u09BC \u09AA\u09CD\u09B0\u0995\u09BE\u09B6 \u0993 \u0985\u09A8\u09C1\u099A\u09CD\u099B\u09C7\u09A6 \u09B0\u099A\u09A8\u09BE", "\u09AD\u09BE\u09B7\u09BE\u09AA\u09B2\u09CD\u09B2\u09AC \u09EA: \u09B8\u09AE\u09BE\u09B0\u09CD\u09A5\u0995 \u09B6\u09AC\u09CD\u09A6, \u09AC\u09BF\u09AA\u09B0\u09C0\u09A4 \u09B6\u09AC\u09CD\u09A6, \u098F\u0995\u0995\u09A5\u09BE\u09AF\u09BC \u09AA\u09CD\u09B0\u0995\u09BE\u09B6 \u0993 \u0985\u09A8\u09C1\u099A\u09CD\u099B\u09C7\u09A6 \u09B0\u099A\u09A8\u09BE", "\u092D\u093E\u0937\u093E\u092A\u0932\u094D\u0932\u0935 4: \u092A\u0930\u094D\u092F\u093E\u092F\u0935\u093E\u091A\u0940, \u0935\u093F\u0932\u094B\u092E \u0936\u092C\u094D\u0926, \u0935\u093E\u0915\u094D\u092F\u093E\u0902\u0936 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u0936\u092C\u094D\u0926 \u0914\u0930 \u0905\u0928\u0941\u091A\u094D\u091B\u0947\u0926 \u0932\u0947\u0916\u0928", ["\u09B6\u09AC\u09CD\u09A6\u09AD\u09BE\u09A3\u09CD\u09A1\u09BE\u09B0 \u0993 \u09A8\u09BF\u09B0\u09CD\u09AE\u09BF\u09A4\u09BF \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8"], TB_BN_5)
      ]
    },
    6: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_BN_6,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Sahitya Mela, Bhashacharcha & Haja-Bara-La Class VI",
      boardNote: {
        en: "Official WBBSE Class VI Sahitya Mela, Bhashacharcha & Haja-Bara-La \u2014 All 12 Verified Units.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09B7\u09B7\u09CD\u09A0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE, \u09AD\u09BE\u09B7\u09BE\u099A\u09B0\u09CD\u099A\u09BE \u0993 \u09B9\u09AF\u09AC\u09B0\u09B2 \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E8\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 6 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E, \u092D\u093E\u0937\u093E\u091A\u0930\u094D\u091A\u093E \u0914\u0930 \u0939-\u092F-\u092C-\u0930-\u0932 \u2014 \u0938\u092D\u0940 12 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("bn6_c1", 1, "Sahitya Mela 1: \u09AD\u09B0\u09A6\u09C1\u09AA\u09C1\u09B0\u09C7 (Nirendranath Chakravarti) & \u09B8\u09C7\u09A8\u09BE\u09AA\u09A4\u09BF \u09B6\u0999\u09CD\u0995\u09B0 (Shyamal Gangopadhyay)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09E7: \u09AD\u09B0\u09A6\u09C1\u09AA\u09C1\u09B0\u09C7 (\u09A8\u09C0\u09B0\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u099A\u0995\u09CD\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0) \u0993 \u09B8\u09C7\u09A8\u09BE\u09AA\u09A4\u09BF \u09B6\u0999\u09CD\u0995\u09B0 (\u09B6\u09CD\u09AF\u09BE\u09AE\u09B2 \u0997\u0999\u09CD\u0997\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 1: \u092D\u0930\u0926\u0941\u092A\u0941\u0930\u0947 (\u0928\u0940\u0930\u0947\u0902\u0926\u094D\u0930\u0928\u093E\u0925 \u091A\u0915\u094D\u0930\u0935\u0930\u094D\u0924\u0940) \u0914\u0930 \u0938\u0947\u0928\u093E\u092A\u0924\u093F \u0936\u0902\u0915\u0930", ["\u0985\u09B6\u09CD\u09AC\u09A4\u09CD\u09A5 \u0997\u09BE\u099B \u0993 \u0985\u09B2\u09B8 \u09A6\u09C1\u09AA\u09C1\u09B0\u09C7\u09B0 \u099B\u09AC\u09BF", "\u0986\u0995\u09A8\u09CD\u09A6\u09AC\u09BE\u09A1\u09BC\u09BF \u09B8\u09CD\u0995\u09C1\u09B2\u09C7\u09B0 \u09B6\u0999\u09CD\u0995\u09B0 \u0993 \u09B6\u0999\u09CD\u0996\u099A\u09BF\u09B2-\u0998\u09CB\u09B2\u09AA\u09C1\u0995\u09C1\u09B0"], TB_BN_6),
        ch("bn6_c2", 2, "Sahitya Mela 2: \u09AA\u09BE\u0987\u09A8 \u09A6\u09BE\u0981\u09DC\u09BF\u09DF\u09C7 \u0986\u0995\u09BE\u09B6\u09C7 \u09A8\u09AF\u09BC\u09A8 \u09A4\u09C1\u09B2\u09BF (Heinrich Heine / Satyendranath Dutta) & \u09AE\u09A8-\u09AD\u09BE\u09B2\u09CB-\u0995\u09B0\u09BE (Shankha Ghosh)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09E8: \u09AA\u09BE\u0987\u09A8 \u09A6\u09BE\u0981\u09DC\u09BF\u09DF\u09C7 \u0986\u0995\u09BE\u09B6\u09C7 \u09A8\u09AF\u09BC\u09A8 \u09A4\u09C1\u09B2\u09BF \u0993 \u09AE\u09A8-\u09AD\u09BE\u09B2\u09CB-\u0995\u09B0\u09BE (\u09B6\u0999\u09CD\u0996 \u0998\u09CB\u09B7)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 2: \u092A\u093E\u0907\u0928 \u0926\u093E\u0901\u0921\u093C\u093F\u092F\u0947 \u0906\u0915\u093E\u0936\u0947 \u0914\u0930 \u092E\u0928-\u092D\u093E\u0932\u094B-\u0915\u0930\u093E (\u0936\u0902\u0916 \u0918\u094B\u0937)", ["\u0989\u09A4\u09CD\u09A4\u09B0\u09C7\u09B0 \u09AC\u09B0\u09AB\u09A2\u09BE\u0995\u09BE \u09AA\u09BE\u0987\u09A8 \u0993 \u09A4\u09AA\u09CD\u09A4 \u09AE\u09B0\u09C1\u09AD\u09C2\u09AE\u09BF\u09B0 \u09AA\u09BE\u09AE \u0997\u09BE\u099B\u09C7\u09B0 \u09B8\u09CD\u09AC\u09AA\u09CD\u09A8", "\u09AE\u09BE\u099B\u09B0\u09BE\u0999\u09BE \u09AA\u09BE\u0996\u09BF\u09B0 \u09B0\u0982 \u0993 \u09AA\u09CD\u09B0\u0995\u09C3\u09A4\u09BF"], TB_BN_6),
        ch("bn6_c3", 3, "Sahitya Mela 3: \u09AA\u09B6\u09C1\u09AA\u09BE\u0996\u09BF\u09B0 \u09AD\u09BE\u09B7\u09BE (Subinoy Raychaudhuri) & \u0998\u09BE\u09B8\u09AB\u09A1\u09BC\u09BF\u0982 (Arun Mitra)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09E9: \u09AA\u09B6\u09C1\u09AA\u09BE\u0996\u09BF\u09B0 \u09AD\u09BE\u09B7\u09BE (\u09B8\u09C1\u09AC\u09BF\u09A8\u09AF\u09BC \u09B0\u09BE\u09AF\u09BC\u099A\u09CC\u09A7\u09C1\u09B0\u09C0) \u0993 \u0998\u09BE\u09B8\u09AB\u09A1\u09BC\u09BF\u0982 (\u0985\u09B0\u09C1\u09A3 \u09AE\u09BF\u09A4\u09CD\u09B0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 3: \u092A\u0936\u0941\u092A\u093E\u0916\u093F\u0930 \u092D\u093E\u0937\u093E \u0914\u0930 \u0918\u093E\u0938\u092B\u0921\u093C\u093F\u0902\u0917 (\u0905\u0930\u0941\u0923 \u092E\u093F\u0924\u094D\u0930)", ["\u09B0\u09BF\u0989\u09AC\u09C7\u09A8 \u0995\u09BE\u09B8\u09CD\u099F\u09BE\u0982 \u0993 \u09AA\u09B6\u09C1\u09AA\u09BE\u0996\u09BF\u09B0 \u09B8\u0982\u0995\u09C7\u09A4", "\u09B8\u09AC\u09C1\u099C \u0998\u09BE\u09B8\u09AB\u09A1\u09BC\u09BF\u0982\u09AF\u09BC\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u0995\u09AC\u09BF\u09B0 \u0986\u09A4\u09CD\u09AE\u09C0\u09AF\u09BC\u09A4\u09BE"], TB_BN_6),
        ch("bn6_c4", 4, "Sahitya Mela 4: \u0995\u09C1\u09AE\u09CB\u09B0\u09C7-\u09AA\u09CB\u0995\u09BE\u09B0 \u09AC\u09BE\u09B8\u09BE\u09AC\u09BE\u09A1\u09BC\u09BF (Gopalchandra Bhattacharya) & \u099A\u09BF\u09A0\u09BF (Swami Vivekananda)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EA: \u0995\u09C1\u09AE\u09CB\u09B0\u09C7-\u09AA\u09CB\u0995\u09BE\u09B0 \u09AC\u09BE\u09B8\u09BE\u09AC\u09BE\u09A1\u09BC\u09BF (\u0997\u09CB\u09AA\u09BE\u09B2\u099A\u09A8\u09CD\u09A6\u09CD\u09B0 \u09AD\u099F\u09CD\u099F\u09BE\u099A\u09BE\u09B0\u09CD\u09AF) \u0993 \u099A\u09BF\u09A0\u09BF (\u09B8\u09CD\u09AC\u09BE\u09AE\u09C0 \u09AC\u09BF\u09AC\u09C7\u0995\u09BE\u09A8\u09A8\u09CD\u09A6)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 4: \u0915\u0941\u092E\u094B\u0930\u0947-\u092A\u094B\u0915\u093E\u0930 \u092C\u093E\u0938\u093E\u092C\u093E\u0921\u093C\u0940 \u0914\u0930 \u091A\u093F\u0920\u093F (\u0938\u094D\u0935\u093E\u092E\u0940 \u0935\u093F\u0935\u0947\u0915\u093E\u0928\u0902\u0926)", ["\u0995\u09C1\u09AE\u09CB\u09B0\u09C7 \u09AA\u09CB\u0995\u09BE\u09B0 \u09AE\u09BE\u099F\u09BF\u09B0 \u0995\u09C1\u09A0\u09C1\u09B0\u09BF \u0993 \u09AE\u09BE\u0995\u09A1\u09BC\u09B8\u09BE \u09B6\u09BF\u0995\u09BE\u09B0", "\u09AE\u09BF\u09B8 \u09A8\u09CB\u09AC\u09B2\u0995\u09C7 (\u09AD\u0997\u09BF\u09A8\u09C0 \u09A8\u09BF\u09AC\u09C7\u09A6\u09BF\u09A4\u09BE) \u09B2\u09C7\u0996\u09BE \u09B8\u09CD\u09AC\u09BE\u09AE\u09C0\u099C\u09BF\u09B0 \u09AA\u09A4\u09CD\u09B0 (\u09E7\u09EE\u09EF\u09ED)"], TB_BN_6),
        ch("bn6_c5", 5, "Sahitya Mela 5: \u09AE\u09B0\u09B6\u09C1\u09AE\u09C7\u09B0 \u09A6\u09BF\u09A8\u09C7 (Subhash Mukhopadhyay) & \u09AE\u09BE\u099F\u09BF\u09B0 \u0998\u09B0\u09C7 \u09A6\u09C7\u0993\u09AF\u09BC\u09BE\u09B2\u099A\u09BF\u09A4\u09CD\u09B0 (Tapan Kar)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EB: \u09AE\u09B0\u09B6\u09C1\u09AE\u09C7\u09B0 \u09A6\u09BF\u09A8\u09C7 (\u09B8\u09C1\u09AD\u09BE\u09B7 \u09AE\u09C1\u0996\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC) \u0993 \u09AE\u09BE\u099F\u09BF\u09B0 \u0998\u09B0\u09C7 \u09A6\u09C7\u0993\u09AF\u09BC\u09BE\u09B2\u099A\u09BF\u09A4\u09CD\u09B0 (\u09A4\u09AA\u09A8 \u0995\u09B0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 5: \u092E\u0930\u0936\u0941\u092E\u0947\u0930 \u0926\u093F\u0928\u0947 (\u0938\u0941\u092D\u093E\u0937 \u092E\u0941\u0916\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F) \u0914\u0930 \u092E\u093E\u091F\u093F\u0930 \u0918\u0930\u0947 \u0926\u0947\u0935\u093E\u0932\u091A\u093F\u0924\u094D\u0930", ["\u0997\u09CD\u09B0\u09BE\u09AE\u09C7\u09B0 \u099A\u09BE\u09B7\u09AC\u09BE\u09B8 \u0993 \u098B\u09A4\u09C1\u099A\u0995\u09CD\u09B0", "\u09AE\u09BE\u09A8\u09AD\u09C2\u09AE-\u09AA\u09C1\u09B0\u09C1\u09B2\u09BF\u09AF\u09BC\u09BE\u09B0 \u09B8\u09BE\u0981\u0993\u09A4\u09BE\u09B2 \u09A6\u09C7\u0993\u09AF\u09BC\u09BE\u09B2\u099A\u09BF\u09A4\u09CD\u09B0 \u0993 \u09B2\u09CB\u0995\u09B6\u09BF\u09B2\u09CD\u09AA"], TB_BN_6),
        ch("bn6_c6", 6, "Sahitya Mela 6: \u09AA\u09BF\u0981\u09AA\u09A1\u09BC\u09C7 (Amiya Chakravarty), \u09AB\u09BE\u0981\u0995\u09BF (Rajkishore Pattanayak) & \u0986\u09B6\u09C0\u09B0\u09CD\u09AC\u09BE\u09A6 (Dakshinaranjan Mitra Majumdar)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EC: \u09AA\u09BF\u0981\u09AA\u09A1\u09BC\u09C7 (\u0985\u09AE\u09BF\u09AF\u09BC \u099A\u0995\u09CD\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0), \u09AB\u09BE\u0981\u0995\u09BF \u0993 \u0986\u09B6\u09C0\u09B0\u09CD\u09AC\u09BE\u09A6 (\u09A6\u0995\u09CD\u09B7\u09BF\u09A3\u09BE\u09B0\u099E\u09CD\u099C\u09A8 \u09AE\u09BF\u09A4\u09CD\u09B0 \u09AE\u099C\u09C1\u09AE\u09A6\u09BE\u09B0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 6: \u092A\u093F\u0902\u092A\u0921\u093C\u0947 (\u0905\u092E\u093F\u092F \u091A\u0915\u094D\u0930\u0935\u0930\u094D\u0924\u0940), \u092B\u093E\u0901\u0915\u093F \u0914\u0930 \u0906\u0936\u0940\u0930\u094D\u0935\u093E\u0926", ["\u0997\u09CB\u09B2\u09BE\u09AA\u09BE\u09B2\u09C7\u09B0 \u0986\u09AE\u0997\u09BE\u099B \u0993 \u0989\u0987\u09AA\u09CB\u0995\u09BE\u09B0 \u09A2\u09BF\u09AC\u09BF", "\u09AC\u09B0\u09CD\u09B7\u09BE\u09B0 \u09AA\u09BF\u0981\u09AA\u09A1\u09BC\u09C7 \u0993 \u0997\u09BE\u099B\u09C7\u09B0 \u09AA\u09BE\u09A4\u09BE\u09B0 \u09B8\u0982\u09B2\u09BE\u09AA"], TB_BN_6),
        ch("bn6_c7", 7, "Sahitya Mela 7: \u098F\u0995 \u09AD\u09C1\u09A4\u09C1\u09A1\u09BC\u09C7 \u0995\u09BE\u09A3\u09CD\u09A1 (Sivram Chakraborty) & \u09AC\u09BE\u0998 (Abul Bashar)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09ED: \u098F\u0995 \u09AD\u09C1\u09A4\u09C1\u09A1\u09BC\u09C7 \u0995\u09BE\u09A3\u09CD\u09A1 (\u09B6\u09BF\u09AC\u09B0\u09BE\u09AE \u099A\u0995\u09CD\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0) \u0993 \u09AC\u09BE\u0998 (\u0986\u09AC\u09C1\u09B2 \u09AC\u09BE\u09B6\u09BE\u09B0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 7: \u090F\u0915 \u092D\u0941\u0924\u0941\u0921\u093C\u0947 \u0915\u093E\u0902\u0921 (\u0936\u093F\u0935\u0930\u093E\u092E \u091A\u0915\u094D\u0930\u0935\u0930\u094D\u0924\u0940) \u0914\u0930 \u092C\u093E\u0918", ["\u09B0\u09BE\u0981\u099A\u09BF \u09A5\u09C7\u0995\u09C7 \u09B9\u09C1\u09A1\u09CD\u09B0\u09C1 \u09AF\u09BE\u0993\u09AF\u09BC\u09BE\u09B0 \u09AA\u09A5\u09C7 \u09B8\u09BE\u0987\u0995\u09C7\u09B2 \u0993 \u09AC\u09C7\u09AC\u09BF \u0985\u09B8\u09CD\u099F\u09BF\u09A8\u09C7\u09B0 \u09AD\u09C1\u09A4\u09C1\u09A1\u09BC\u09C7 \u0985\u09AD\u09BF\u099C\u09CD\u099E\u09A4\u09BE"], TB_BN_6),
        ch("bn6_c8", 8, "Sahitya Mela 8: \u09AC\u0999\u09CD\u0997 \u0986\u09AE\u09BE\u09B0 \u099C\u09A8\u09A8\u09C0 \u0986\u09AE\u09BE\u09B0 (Dwijendralal Ray) & \u09B6\u09B9\u09BF\u09A6 \u099C\u09CD\u09AF\u09CB\u09A4\u09BF\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u09A6\u09BE\u09B6 (Ashokkumar Mukhopadhyay)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EE: \u09AC\u0999\u09CD\u0997 \u0986\u09AE\u09BE\u09B0 \u099C\u09A8\u09A8\u09C0 \u0986\u09AE\u09BE\u09B0 (\u09A6\u09CD\u09AC\u09BF\u099C\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0\u09B2\u09BE\u09B2 \u09B0\u09BE\u09AF\u09BC) \u0993 \u09B6\u09B9\u09BF\u09A6 \u099C\u09CD\u09AF\u09CB\u09A4\u09BF\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u09A6\u09BE\u09B6", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 8: \u092C\u0902\u0917 \u0906\u092E\u093E\u0930 \u091C\u0928\u0928\u0940 \u0906\u092E\u093E\u0930 (\u0926\u094D\u0935\u093F\u091C\u0947\u0902\u0926\u094D\u0930\u0932\u093E\u0932 \u0930\u093E\u092F) \u0914\u0930 \u0936\u0939\u0940\u0926 \u091C\u0924\u0940\u0928\u094D\u0926\u094D\u0930\u0928\u093E\u0925 \u0926\u093E\u0938", ["\u09B8\u09CD\u09AC\u09A6\u09C7\u09B6\u09AA\u09CD\u09B0\u09C7\u09AE \u0993 \u09B2\u09BE\u09B9\u09CB\u09B0 \u099C\u09C7\u09B2\u09C7 \u09EC\u09E9 \u09A6\u09BF\u09A8 \u0985\u09A8\u09B6\u09A8\u09C7 \u09B6\u09B9\u09BF\u09A6 \u09AF\u09A4\u09C0\u09A8 \u09A6\u09BE\u09B6"], TB_BN_6),
        ch("bn6_c9", 9, "Sahitya Mela 9: \u09B9\u09BE\u099F (Jatindranath Sengupta) & \u09A7\u09B0\u09BE\u09A4\u09B2 (Rabindranath Tagore)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EF: \u09B9\u09BE\u099F (\u09AF\u09A4\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u09B8\u09C7\u09A8\u0997\u09C1\u09AA\u09CD\u09A4) \u0993 \u09A7\u09B0\u09BE\u09A4\u09B2 (\u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u09A0\u09BE\u0995\u09C1\u09B0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 9: \u0939\u093E\u091F (\u092F\u0924\u0940\u0902\u0926\u094D\u0930\u0928\u093E\u0925 \u0938\u0947\u0928\u0917\u0941\u092A\u094D\u0924) \u0914\u0930 \u0927\u0930\u093E\u0924\u0932 (\u0930\u0935\u0940\u0902\u0926\u094D\u0930\u0928\u093E\u0925 \u091F\u0948\u0917\u094B\u0930)", ["\u09A6\u09C2\u09B0\u09C7\u09B0 \u09AA\u09BE\u09B2\u09CD\u09B2\u09BE \u0993 \u0997\u09CD\u09B0\u09BE\u09AE\u09CD\u09AF \u09B9\u09BE\u099F\u09C7\u09B0 \u09B8\u0995\u09BE\u09B2-\u09B8\u09A8\u09CD\u09A7\u09CD\u09AF\u09BE\u09B0 \u09AC\u09C8\u09AA\u09B0\u09C0\u09A4\u09CD\u09AF", "\u09A8\u09CC\u0995\u09BE\u09AF\u09BE\u09A4\u09CD\u09B0\u09BE\u09AF\u09BC \u09AD\u09BE\u09B2\u09CB-\u09AE\u09A8\u09CD\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09AC\u09BE\u09B9\u09AE\u09BE\u09A8\u09A4\u09BE"], TB_BN_6),
        ch("bn6_c10", 10, "Supplementary Reader: \u09B9\u09AF\u09AC\u09B0\u09B2 (Sukumar Ray \u2014 Complete Text)", "\u09B8\u09B9\u09BE\u09AF\u09BC\u0995 \u09AA\u09BE\u09A0: \u09B9\u09AF\u09AC\u09B0\u09B2 (\u09B8\u09C1\u0995\u09C1\u09AE\u09BE\u09B0 \u09B0\u09BE\u09AF\u09BC)", "\u0938\u0939\u093E\u092F\u0915 \u092A\u093E\u0920: \u0939-\u092F-\u092C-\u0930-\u0932 (\u0938\u0941\u0915\u0941\u092E\u093E\u0930 \u0930\u093E\u092F)", ["\u09B0\u09C1\u09AE\u09BE\u09B2 \u09A5\u09C7\u0995\u09C7 \u09AC\u09C7\u09A1\u09BC\u09BE\u09B2, \u0995\u09BE\u0995\u09C7\u09B6\u09CD\u09AC\u09B0 \u0995\u09C1\u099A\u0995\u09C1\u099A\u09C7, \u0989\u09A7\u09CB \u0993 \u09AC\u09C1\u09A7\u09CB, \u09B9\u09BF\u099C\u09BF\u09AC\u09BF\u099C\u09AC\u09BF\u099C, \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3 \u09B6\u09BF\u0982, \u09A8\u09CD\u09AF\u09BE\u09A1\u09BC\u09BE, \u0997\u09C7\u099B\u09CB\u09A6\u09BE\u09A6\u09BE \u0993 \u09AA\u09C7\u0981\u099A\u09BE \u09AC\u09BF\u099A\u09BE\u09B0\u0995"], TB_BN_6),
        ch("bn6_c11", 11, "Bhashacharcha 1: \u09AC\u09BF\u09B8\u09B0\u09CD\u0997\u09B8\u09A8\u09CD\u09A7\u09BF \u0993 \u09B6\u09AC\u09CD\u09A6\u09C7\u09B0 \u0997\u09A0\u09A8 (\u0989\u09AA\u09B8\u09B0\u09CD\u0997, \u0985\u09A8\u09C1\u09B8\u09B0\u09CD\u0997 \u0993 \u09AC\u09BF\u09AD\u0995\u09CD\u09A4\u09BF)", "\u09AD\u09BE\u09B7\u09BE\u099A\u09B0\u09CD\u099A\u09BE \u09E7: \u09AC\u09BF\u09B8\u09B0\u09CD\u0997\u09B8\u09A8\u09CD\u09A7\u09BF, \u0989\u09AA\u09B8\u09B0\u09CD\u0997, \u0985\u09A8\u09C1\u09B8\u09B0\u09CD\u0997 \u0993 \u09AC\u09BF\u09AD\u0995\u09CD\u09A4\u09BF", "\u092D\u093E\u0937\u093E\u091A\u0930\u094D\u091A\u093E 1: \u0935\u093F\u0938\u0930\u094D\u0917 \u0938\u0902\u0927\u093F, \u0909\u092A\u0938\u0930\u094D\u0917, \u0905\u0928\u0941\u0938\u0930\u094D\u0917 \u0914\u0930 \u0935\u093F\u092D\u0915\u094D\u0924\u093F", ["\u09B0-\u099C\u09BE\u09A4 \u0993 \u09B8-\u099C\u09BE\u09A4 \u09AC\u09BF\u09B8\u09B0\u09CD\u0997\u09B8\u09A8\u09CD\u09A7\u09BF", "\u09AE\u09CC\u09B2\u09BF\u0995 \u0993 \u09B8\u09BE\u09A7\u09BF\u09A4 \u09B6\u09AC\u09CD\u09A6, \u0989\u09AA\u09B8\u09B0\u09CD\u0997 \u0993 \u0985\u09A8\u09C1\u09B8\u09B0\u09CD\u0997\u09C7\u09B0 \u09AA\u09BE\u09B0\u09CD\u09A5\u0995\u09CD\u09AF"], TB_BN_6),
        ch("bn6_c12", 12, "Bhashacharcha 2: \u09B0\u09C2\u09AA\u09A4\u09A4\u09CD\u09A4\u09CD\u09AC \u2014 \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09AC\u09BE\u099A\u0995 \u0993 \u09AA\u09C2\u09B0\u09A3\u09AC\u09BE\u099A\u0995 \u09B6\u09AC\u09CD\u09A6, \u09B8\u09AE\u09BE\u09B0\u09CD\u09A5\u0995 \u09B6\u09AC\u09CD\u09A6, \u09AC\u09BE\u0997\u09A7\u09BE\u09B0\u09BE \u0993 \u09AA\u09A4\u09CD\u09B0\u09B0\u099A\u09A8\u09BE", "\u09AD\u09BE\u09B7\u09BE\u099A\u09B0\u09CD\u099A\u09BE \u09E8: \u09B0\u09C2\u09AA\u09A4\u09A4\u09CD\u09A4\u09CD\u09AC, \u09AC\u09BE\u0997\u09A7\u09BE\u09B0\u09BE, \u09B8\u09AE\u09BE\u09B0\u09CD\u09A5\u0995 \u09B6\u09AC\u09CD\u09A6 \u0993 \u09AA\u09A4\u09CD\u09B0\u09B0\u099A\u09A8\u09BE", "\u092D\u093E\u0937\u093E\u091A\u0930\u094D\u091A\u093E 2: \u0930\u0942\u092A\u0924\u0924\u094D\u0924\u094D\u0935, \u092E\u0941\u0939\u093E\u0935\u0930\u0947, \u092A\u0930\u094D\u092F\u093E\u092F\u0935\u093E\u091A\u0940 \u0914\u0930 \u092A\u0924\u094D\u0930 \u0932\u0947\u0916\u0928", ["\u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09AC\u09BE\u099A\u0995 \u0993 \u09AA\u09C2\u09B0\u09A3\u09AC\u09BE\u099A\u0995 \u09AC\u09BF\u09B6\u09C7\u09B7\u09A3", "\u09AA\u09A4\u09CD\u09B0\u09B2\u09BF\u0996\u09A8 \u0993 \u0985\u09A8\u09C1\u099A\u09CD\u099B\u09C7\u09A6 \u09B0\u099A\u09A8\u09BE"], TB_BN_6)
      ]
    },
    7: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_BN_7,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Sahitya Mela, Bhashacharcha & Maku Class VII",
      boardNote: {
        en: "Official WBBSE Class VII Sahitya Mela, Bhashacharcha & Maku \u2014 All 12 Verified Units.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09B8\u09AA\u09CD\u09A4\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE, \u09AD\u09BE\u09B7\u09BE\u099A\u09B0\u09CD\u099A\u09BE \u0993 \u09AE\u09BE\u0995\u09C1 \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E8\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 7 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E, \u092D\u093E\u0937\u093E\u091A\u0930\u094D\u091A\u093E \u0914\u0930 \u092E\u093E\u0915\u0942 \u2014 \u0938\u092D\u0940 12 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("bn7_c1", 1, "Sahitya Mela 1: \u099B\u09A8\u09CD\u09A6\u09C7 \u09B6\u09C1\u09A7\u09C1 \u0995\u09BE\u09A8 \u09B0\u09BE\u0996\u09CB (Ajit Datta) & \u09AA\u09BE\u0997\u09B2\u09BE \u0997\u09A3\u09C7\u09B6 (Shirshendu Mukhopadhyay)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09E7: \u099B\u09A8\u09CD\u09A6\u09C7 \u09B6\u09C1\u09A7\u09C1 \u0995\u09BE\u09A8 \u09B0\u09BE\u0996\u09CB (\u0985\u099C\u09BF\u09CE \u09A6\u09A4\u09CD\u09A4) \u0993 \u09AA\u09BE\u0997\u09B2\u09BE \u0997\u09A3\u09C7\u09B6 (\u09B6\u09C0\u09B0\u09CD\u09B7\u09C7\u09A8\u09CD\u09A6\u09C1 \u09AE\u09C1\u0996\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 1: \u091B\u0902\u0926\u0947 \u0936\u0941\u0927\u0941 \u0915\u093E\u0928 \u0930\u093E\u0916\u094B (\u0905\u091C\u093F\u0924 \u0926\u0924\u094D\u0924) \u0914\u0930 \u092A\u093E\u0917\u0932\u093E \u0917\u0923\u0947\u0936 (\u0936\u0940\u0930\u094D\u0937\u0947\u0902\u0926\u0941 \u092E\u0941\u0916\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F)", ["\u09AA\u09CD\u09B0\u0995\u09C3\u09A4\u09BF \u0993 \u099C\u09C0\u09AC\u09A8\u09C7\u09B0 \u099B\u09A8\u09CD\u09A6", "\u09E9\u09EB\u09EE\u09EF \u09B8\u09BE\u09B2\u09C7\u09B0 \u0995\u09B2\u09CD\u09AA\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u0995\u09AC\u09BF\u09A4\u09BE-\u09B6\u09BF\u09B2\u09CD\u09AA\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0\u0995\u09C7 \u09AC\u09BE\u0981\u099A\u09BE\u09A8\u09CB"], TB_BN_7),
        ch("bn7_c2", 2, "Sahitya Mela 2: \u09AC\u0999\u09CD\u0997\u09AD\u09C2\u09AE\u09BF\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF (Michael Madhusudan Dutt) & \u098F\u0995\u09C1\u09B6\u09C7\u09B0 \u0995\u09AC\u09BF\u09A4\u09BE (Ashraf Siddiqui)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09E8: \u09AC\u0999\u09CD\u0997\u09AD\u09C2\u09AE\u09BF\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF (\u09AE\u09BE\u0987\u0995\u09C7\u09B2 \u09AE\u09A7\u09C1\u09B8\u09C2\u09A6\u09A8 \u09A6\u09A4\u09CD\u09A4) \u0993 \u098F\u0995\u09C1\u09B6\u09C7\u09B0 \u0995\u09AC\u09BF\u09A4\u09BE (\u0986\u09B6\u09B0\u09BE\u09AB \u09B8\u09BF\u09A6\u09CD\u09A6\u09BF\u0995\u09C0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 2: \u092C\u0902\u0917\u092D\u0942\u092E\u093F\u0930 \u092A\u094D\u0930\u0924\u093F (\u092E\u093E\u0907\u0915\u0932 \u092E\u0927\u0941\u0938\u0942\u0926\u0928 \u0926\u0924\u094D\u0924) \u0914\u0930 \u090F\u0915\u0941\u0936\u0947\u0930 \u0915\u0935\u093F\u0924\u093E", ["\u09AA\u09CD\u09B0\u09AC\u09BE\u09B8\u09C7 \u0995\u09AC\u09BF\u09B0 \u09AE\u09BE\u09A4\u09C3\u09AD\u09C2\u09AE\u09BF \u09B8\u09CD\u09AE\u09B0\u09A3", "\u09AD\u09BE\u09B7\u09BE \u09B6\u09B9\u09BF\u09A6 \u09A6\u09BF\u09AC\u09B8 \u0993 \u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE\u09B0 \u0990\u09A4\u09BF\u09B9\u09CD\u09AF"], TB_BN_7),
        ch("bn7_c3", 3, "Sahitya Mela 3: \u0986\u09A4\u09CD\u09AE\u0995\u09A5\u09BE (Ramkinkar Baij) & \u0986\u0981\u0995\u09BE, \u09B2\u09C7\u0996\u09BE (Mridul Dasgupta)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09E9: \u0986\u09A4\u09CD\u09AE\u0995\u09A5\u09BE (\u09B0\u09BE\u09AE\u0995\u09BF\u0999\u09CD\u0995\u09B0 \u09AC\u09C7\u0987\u099C) \u0993 \u0986\u0981\u0995\u09BE, \u09B2\u09C7\u0996\u09BE (\u09AE\u09C3\u09A6\u09C1\u09B2 \u09A6\u09BE\u09B6\u0997\u09C1\u09AA\u09CD\u09A4)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 3: \u0906\u0924\u094D\u092E\u0915\u0925\u093E (\u0930\u093E\u092E\u0915\u093F\u0902\u0915\u0930 \u092C\u0948\u091C) \u0914\u0930 \u0906\u0901\u0915\u093E, \u0932\u0947\u0916\u093E", ["\u09B6\u09BF\u09B2\u09CD\u09AA\u09C0 \u09B0\u09BE\u09AE\u0995\u09BF\u0999\u09CD\u0995\u09B0 \u09AC\u09C7\u0987\u099C\u09C7\u09B0 \u09B6\u09C8\u09B6\u09AC, \u09AC\u09BE\u0981\u0995\u09C1\u09A1\u09BC\u09BE \u0993 \u09B6\u09BE\u09A8\u09CD\u09A4\u09BF\u09A8\u09BF\u0995\u09C7\u09A4\u09A8 (\u0985\u09AF\u09BC\u09C7\u09B2 \u09AA\u09C7\u09A8\u09CD\u099F\u09BF\u0982 \u0993 \u09AD\u09BE\u09B8\u09CD\u0995\u09B0\u09CD\u09AF)"], TB_BN_7),
        ch("bn7_c4", 4, "Sahitya Mela 4: \u0996\u09CB\u0995\u09A8\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A5\u09AE \u099B\u09AC\u09BF (Banaphool) & \u0995\u09C1\u09A4\u09C1\u09AC \u09AE\u09BF\u09A8\u09BE\u09B0\u09C7\u09B0 \u0995\u09A5\u09BE (Syed Mujtaba Ali)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EA: \u0996\u09CB\u0995\u09A8\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A5\u09AE \u099B\u09AC\u09BF (\u09AC\u09A8\u09AB\u09C1\u09B2) \u0993 \u0995\u09C1\u09A4\u09C1\u09AC \u09AE\u09BF\u09A8\u09BE\u09B0\u09C7\u09B0 \u0995\u09A5\u09BE (\u09B8\u09C8\u09AF\u09BC\u09A6 \u09AE\u09C1\u099C\u09A4\u09AC\u09BE \u0986\u09B2\u09C0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 4: \u0916\u094B\u0915\u0928\u0947\u0930 \u092A\u094D\u0930\u0925\u092E \u091B\u092C\u093F (\u092C\u0928\u092B\u0942\u0932) \u0914\u0930 \u0915\u0941\u0924\u0941\u092C \u092E\u0940\u0928\u093E\u0930 \u0915\u0940 \u0915\u0925\u093E (\u0938\u0948\u092F\u0926 \u092E\u0941\u091C\u0924\u092C\u093E \u0905\u0932\u0940)", ["\u09A8\u09BF\u099C\u09C7\u09B0 \u0995\u09B2\u09CD\u09AA\u09A8\u09BE\u09AF\u09BC \u0986\u0981\u0995\u09BE \u0985\u09A8\u09CD\u09A7\u0995\u09BE\u09B0\u09C7\u09B0 \u099B\u09AC\u09BF", "\u0995\u09C1\u09A4\u09C1\u09AC \u09AE\u09BF\u09A8\u09BE\u09B0\u09C7\u09B0 \u09AA\u09BE\u0981\u099A\u09A4\u09B2\u09BE \u09B8\u09CD\u09A5\u09BE\u09AA\u09A4\u09CD\u09AF\u09C7\u09B0 \u09AC\u09BF\u09B6\u09CD\u09AC\u09B6\u09CD\u09B0\u09C7\u09B7\u09CD\u09A0\u09A4\u09CD\u09AC"], TB_BN_7),
        ch("bn7_c5", 5, "Sahitya Mela 5: \u0995\u09BE\u099C\u09C0 \u09A8\u099C\u09B0\u09C1\u09B2\u09C7\u09B0 \u0997\u09BE\u09A8 (Kazi Nazrul Islam / Ramkumar Chattopadhyay) & \u09B8\u09CD\u09AE\u09C3\u09A4\u09BF\u099A\u09BF\u09B9\u09CD\u09A8 (Kamini Roy)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EB: \u0995\u09BE\u099C\u09C0 \u09A8\u099C\u09B0\u09C1\u09B2\u09C7\u09B0 \u0997\u09BE\u09A8 (\u09B0\u09BE\u09AE\u0995\u09C1\u09AE\u09BE\u09B0 \u099A\u099F\u09CD\u099F\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC) \u0993 \u09B8\u09CD\u09AE\u09C3\u09A4\u09BF\u099A\u09BF\u09B9\u09CD\u09A8 (\u0995\u09BE\u09AE\u09BF\u09A8\u09C0 \u09B0\u09BE\u09AF\u09BC)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 5: \u0915\u093E\u091C\u093C\u0940 \u0928\u091C\u093C\u0930\u0941\u0932 \u0915\u0947 \u0917\u0940\u0924 \u0914\u0930 \u0938\u094D\u092E\u0943\u0924\u093F\u091A\u093F\u0939\u094D\u0928 (\u0915\u093E\u092E\u093F\u0928\u0940 \u0930\u093E\u092F)", ["\u09A8\u09C7\u09A4\u09BE\u099C\u09BF \u0993 \u09A8\u099C\u09B0\u09C1\u09B2\u09C7\u09B0 \u09B8\u09BE\u0995\u09CD\u09B7\u09BE\u09CE", "\u09AA\u09BE\u09A5\u09B0\u09C7\u09B0 \u09B8\u09CC\u09A7 \u09AC\u09A8\u09BE\u09AE \u09AE\u09BE\u09A8\u09C1\u09B7\u09C7\u09B0 \u09B9\u09C3\u09A6\u09AF\u09BC\u09C7 \u0985\u09AE\u09B0\u09A4\u09CD\u09AC"], TB_BN_7),
        ch("bn7_c6", 6, "Sahitya Mela 6: \u099A\u09BF\u09B0\u09A6\u09BF\u09A8\u09C7\u09B0 (Sukanta Bhattacharya) & \u09AE\u09C7\u0998\u099A\u09CB\u09B0 (Sunil Gangopadhyay)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EC: \u099A\u09BF\u09B0\u09A6\u09BF\u09A8\u09C7\u09B0 (\u09B8\u09C1\u0995\u09BE\u09A8\u09CD\u09A4 \u09AD\u099F\u09CD\u099F\u09BE\u099A\u09BE\u09B0\u09CD\u09AF) \u0993 \u09AE\u09C7\u0998\u099A\u09CB\u09B0 (\u09B8\u09C1\u09A8\u09C0\u09B2 \u0997\u0999\u09CD\u0997\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 6: \u091A\u093F\u0930\u0926\u093F\u0928\u0947\u0930 (\u0938\u0941\u0915\u093E\u0902\u0924 \u092D\u091F\u094D\u091F\u093E\u091A\u093E\u0930\u094D\u092F) \u0914\u0930 \u092E\u0947\u0918\u091A\u094B\u0930 (\u0938\u0941\u0928\u0940\u0932 \u0917\u0902\u0917\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F)", ["\u09A6\u09C1\u09B0\u09CD\u09AD\u09BF\u0995\u09CD\u09B7\u09AA\u09C0\u09A1\u09BC\u09BF\u09A4 \u09AA\u09B2\u09CD\u09B2\u09BF\u0997\u09CD\u09B0\u09BE\u09AE\u09C7\u09B0 \u0985\u09AA\u09B0\u09BE\u099C\u09BF\u09A4 \u099C\u09C0\u09AC\u09A8\u09B6\u0995\u09CD\u09A4\u09BF", "\u09AA\u09C1\u09B0\u09A8\u09CD\u09A6\u09B0 \u099A\u09CC\u09A7\u09C1\u09B0\u09C0 \u0993 \u0985\u09B8\u09C0\u09AE\u09BE\u09B0 \u09B8\u09BE\u0987\u09AC\u09C7\u09B0\u09BF\u09AF\u09BC\u09BE\u09B0 \u09AE\u09C7\u0998 \u0993 \u0985\u09CD\u09AF\u09BE\u09B2\u09AF\u09BC \u09B8\u0982\u0995\u09B0 \u09A7\u09BE\u09A4\u09C1"], TB_BN_7),
        ch("bn7_c7", 7, "Sahitya Mela 7: \u09A6\u09C1\u099F\u09BF \u0997\u09BE\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AE\u0995\u09A5\u09BE (Shibdas Bandyopadhyay) & \u09B8\u09AA\u09CD\u09A4\u09AE \u09AC\u09BE\u09B9\u09BF\u09A8\u09C0 (Satyajit Ray)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09ED: \u09A6\u09C1\u099F\u09BF \u0997\u09BE\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AE\u0995\u09A5\u09BE \u0993 \u09AD\u09BE\u09A8\u09C1\u09B8\u09BF\u0982\u09B9\u09C7\u09B0 \u09AA\u09A4\u09CD\u09B0\u09BE\u09AC\u09B2\u09BF (\u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u09A0\u09BE\u0995\u09C1\u09B0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 7: \u0926\u0941\u091F\u093F \u0917\u093E\u0928\u0947\u0930 \u091C\u0928\u094D\u092E\u0915\u0925\u093E \u0914\u0930 \u092D\u093E\u0928\u0941\u0938\u093F\u0902\u0939\u0947\u0930 \u092A\u0924\u094D\u0930\u093E\u0935\u0932\u0940", ["\u099C\u09A8\u0997\u09A3\u09AE\u09A8 \u0993 \u0995\u09A6\u09AE \u0995\u09A6\u09AE \u09AC\u09BE\u09A1\u09BC\u09BE\u09AF\u09BC\u09C7 \u09AF\u09BE \u0997\u09BE\u09A8\u09C7\u09B0 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8", "\u09B0\u09BE\u09A3\u09C1\u0995\u09C7 \u09B2\u09C7\u0996\u09BE \u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5\u09C7\u09B0 \u09AA\u09A4\u09CD\u09B0"], TB_BN_7),
        ch("bn7_c8", 8, "Sahitya Mela 8: \u09B0\u09BE\u09B8\u09CD\u09A4\u09BE\u09AF\u09BC \u0995\u09CD\u09B0\u09BF\u0995\u09C7\u099F \u0996\u09C7\u09B2\u09BE (Moti Nandi) & \u0997\u09BE\u09A7\u09BE\u09B0 \u0995\u09BE\u09A8 (Sharadindu Bandyopadhyay)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EE: \u09B0\u09BE\u09B8\u09CD\u09A4\u09BE\u09AF\u09BC \u0995\u09CD\u09B0\u09BF\u0995\u09C7\u099F \u0996\u09C7\u09B2\u09BE (\u09AE\u09A4\u09BF \u09A8\u09A8\u09CD\u09A6\u09C0) \u0993 \u0997\u09BE\u09A7\u09BE\u09B0 \u0995\u09BE\u09A8 (\u09B6\u09B0\u09A6\u09BF\u09A8\u09CD\u09A6\u09C1 \u09AC\u09A8\u09CD\u09A6\u09CD\u09AF\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 8: \u0930\u093E\u0938\u094D\u0924\u093E\u092F \u0915\u094D\u0930\u093F\u0915\u0947\u091F \u0916\u0947\u0932\u093E (\u092E\u0924\u093F \u0928\u0902\u0926\u0940) \u0914\u0930 \u0917\u093E\u0927\u093E\u0930 \u0915\u093E\u0928 (\u0936\u0930\u0926\u093F\u0902\u0926\u0941 \u092C\u0902\u0926\u094D\u092F\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F)", ["\u09AD\u09BE\u09B0\u09CD\u09A8\u09BE\u09B0, \u09B8\u09C7\u09B2\u09BF\u09AE \u0993 \u0985\u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09B2\u09BF\u09AF\u09BC\u09BE\u09B0 \u09B2\u09BF\u09B2\u09BF; \u099F\u09C1\u09A8\u09C1\u09B0 \u09AB\u09C1\u099F\u09AC\u09B2 \u09AE\u09CD\u09AF\u09BE\u099A \u0993 \u0997\u09BE\u09A7\u09BE \u099B\u09CB\u0981\u09AF\u09BC\u09BE\u09B0 \u0995\u09C1\u09B8\u0982\u09B8\u09CD\u0995\u09BE\u09B0 \u099C\u09AF\u09BC"], TB_BN_7),
        ch("bn7_c9", 9, "Sahitya Mela 9: \u09AA\u099F\u09B2\u09AC\u09BE\u09AC\u09C1 \u09AB\u09BF\u09B2\u09CD\u09AE\u09B8\u09CD\u099F\u09BE\u09B0 (Satyajit Ray) & \u09A6\u09BF\u09A8-\u09AB\u09C1\u09B0\u09CB\u09B2\u09C7 (Shankha Ghosh)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EF: \u09AA\u099F\u09B2\u09AC\u09BE\u09AC\u09C1 \u09AB\u09BF\u09B2\u09CD\u09AE\u09B8\u09CD\u099F\u09BE\u09B0 (\u09B8\u09A4\u09CD\u09AF\u099C\u09BF\u09CE \u09B0\u09BE\u09AF\u09BC) \u0993 \u09A6\u09BF\u09A8-\u09AB\u09C1\u09B0\u09CB\u09B2\u09C7 (\u09B6\u0999\u09CD\u0996 \u0998\u09CB\u09B7)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 9: \u092A\u091F\u0932\u092C\u093E\u092C\u0942 \u092B\u093C\u093F\u0932\u094D\u092E\u0938\u094D\u091F\u093E\u0930 (\u0938\u0924\u094D\u092F\u091C\u0940\u0924 \u0930\u093E\u092F) \u0914\u0930 \u0926\u093F\u0928-\u092B\u0941\u0930\u094B\u0932\u0947 (\u0936\u0902\u0916 \u0918\u094B\u0937)", ['\u09AA\u099F\u09B2\u09AC\u09BE\u09AC\u09C1\u09B0 \u09AE\u09BE\u09A4\u09CD\u09B0 \u098F\u0995\u099F\u09BF \u09B6\u09AC\u09CD\u09A6 "\u0986\u0983!" \u09B8\u0982\u09B2\u09BE\u09AA\u0995\u09C7 \u09A8\u09BF\u0996\u09C1\u0981\u09A4 \u09B6\u09BF\u09B2\u09CD\u09AA\u09C7 \u0989\u09A4\u09CD\u09A4\u09C0\u09B0\u09CD\u09A3 \u0995\u09B0\u09BE \u0993 \u0997\u0997\u09A8 \u09AA\u09BE\u0995\u09A1\u09BC\u09BE\u09B6\u09BF\u09B0 \u09B6\u09BF\u0995\u09CD\u09B7\u09BE'], TB_BN_7),
        ch("bn7_c10", 10, "Supplementary Reader: \u09AE\u09BE\u0995\u09C1 (Leela Majumdar \u2014 Complete Novel)", "\u09B8\u09B9\u09BE\u09AF\u09BC\u0995 \u09AA\u09BE\u09A0: \u09AE\u09BE\u0995\u09C1 (\u09B2\u09C0\u09B2\u09BE \u09AE\u099C\u09C1\u09AE\u09A6\u09BE\u09B0)", "\u0938\u0939\u093E\u092F\u0915 \u092A\u093E\u0920: \u092E\u093E\u0915\u0942 (\u0932\u0940\u0932\u093E \u092E\u091C\u0942\u092E\u0926\u093E\u0930)", ["\u09B8\u09CB\u09A8\u09BE, \u099F\u09BF\u09AF\u09BC\u09BE, \u0998\u09A1\u09BC\u09BF\u0993\u09AF\u09BC\u09BE\u09B2\u09BE, \u09B9\u09CB\u099F\u09C7\u09B2\u0993\u09AF\u09BC\u09BE\u09B2\u09BE, \u09B8\u0982, \u09AA\u09B0\u09BF, \u099C\u09BE\u09A8\u09CB\u09AF\u09BC\u09BE\u09B0\u09C7\u09B0 \u09A6\u09B2 \u0993 \u09A6\u09AE-\u09A6\u09C7\u0993\u09AF\u09BC\u09BE \u09AF\u09A8\u09CD\u09A4\u09CD\u09B0\u09AE\u09BE\u09A8\u09AC \u09AE\u09BE\u0995\u09C1"], TB_BN_7),
        ch("bn7_c11", 11, "Bhashacharcha 1: \u09AC\u09BE\u0982\u09B2\u09BE \u09AC\u09BE\u09A8\u09BE\u09A8, \u09AC\u09CD\u09AF\u099E\u09CD\u099C\u09A8\u09B8\u09A8\u09CD\u09A7\u09BF, \u09A4\u09A6\u09CD\u09AD\u09AC-\u09A4\u09CE\u09B8\u09AE-\u09A6\u09C7\u09B6\u09BF-\u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u09B6\u09AC\u09CD\u09A6 \u0993 \u09AA\u09A6\u09BE\u09A8\u09CD\u09A4\u09B0", "\u09AD\u09BE\u09B7\u09BE\u099A\u09B0\u09CD\u099A\u09BE \u09E7: \u09AC\u09CD\u09AF\u099E\u09CD\u099C\u09A8\u09B8\u09A8\u09CD\u09A7\u09BF, \u09AC\u09BE\u0982\u09B2\u09BE \u09B6\u09AC\u09CD\u09A6\u09AD\u09BE\u09A3\u09CD\u09A1\u09BE\u09B0 \u0993 \u09AA\u09A6\u09BE\u09A8\u09CD\u09A4\u09B0", "\u092D\u093E\u0937\u093E\u091A\u0930\u094D\u091A\u093E 1: \u0935\u094D\u092F\u0902\u091C\u0928 \u0938\u0902\u0927\u093F, \u0936\u092C\u094D\u0926 \u092D\u0902\u0921\u093E\u0930 (\u0924\u0924\u094D\u0938\u092E, \u0924\u0926\u094D\u092D\u0935, \u0926\u0947\u0936\u091C, \u0935\u093F\u0926\u0947\u0936\u0940) \u0914\u0930 \u092A\u0926\u093E\u0902\u0924\u0930", ["\u09A4\u09CE\u09B8\u09AE, \u0985\u09B0\u09CD\u09A7\u09A4\u09CE\u09B8\u09AE, \u09A4\u09A6\u09CD\u09AD\u09AC, \u09A6\u09C7\u09B6\u09BF \u0993 \u0986\u0997\u09A8\u09CD\u09A4\u09C1\u0995 \u09B6\u09AC\u09CD\u09A6", "\u09AC\u09BF\u09B6\u09C7\u09B7\u09CD\u09AF \u09A5\u09C7\u0995\u09C7 \u09AC\u09BF\u09B6\u09C7\u09B7\u09A3 \u0993 \u09AC\u09BF\u09B6\u09C7\u09B7\u09A3 \u09A5\u09C7\u0995\u09C7 \u09AC\u09BF\u09B6\u09C7\u09B7\u09CD\u09AF\u09C7 \u09AA\u09A6\u09BE\u09A8\u09CD\u09A4\u09B0"], TB_BN_7),
        ch("bn7_c12", 12, "Bhashacharcha 2: \u0995\u09BE\u09B0\u0995 \u0993 \u09AC\u09BF\u09AD\u0995\u09CD\u09A4\u09BF (\u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995 \u09A7\u09BE\u09B0\u09A3\u09BE), \u098F\u0995\u0995\u09A5\u09BE\u09AF\u09BC \u09AA\u09CD\u09B0\u0995\u09BE\u09B6, \u09AA\u09CD\u09B0\u09AC\u09BE\u09A6-\u09AA\u09CD\u09B0\u09AC\u099A\u09A8 \u0993 \u09AA\u09CD\u09B0\u09AC\u09A8\u09CD\u09A7 \u09B0\u099A\u09A8\u09BE", "\u09AD\u09BE\u09B7\u09BE\u099A\u09B0\u09CD\u099A\u09BE \u09E8: \u0995\u09BE\u09B0\u0995-\u09AC\u09BF\u09AD\u0995\u09CD\u09A4\u09BF, \u09AA\u09CD\u09B0\u09AC\u09BE\u09A6-\u09AA\u09CD\u09B0\u09AC\u099A\u09A8 \u0993 \u09AA\u09CD\u09B0\u09AC\u09A8\u09CD\u09A7 \u09B0\u099A\u09A8\u09BE", "\u092D\u093E\u0937\u093E\u091A\u0930\u094D\u091A\u093E 2: \u0915\u093E\u0930\u0915 \u0914\u0930 \u0935\u093F\u092D\u0915\u094D\u0924\u093F, \u0932\u094B\u0915\u094B\u0915\u094D\u0924\u093F\u092F\u093E\u0901 \u0914\u0930 \u0928\u093F\u092C\u0902\u0927 \u0932\u0947\u0916\u0928", ["\u0995\u09B0\u09CD\u09A4\u09C3, \u0995\u09B0\u09CD\u09AE, \u0995\u09B0\u09A3, \u09A8\u09BF\u09AE\u09BF\u09A4\u09CD\u09A4, \u0985\u09AA\u09BE\u09A6\u09BE\u09A8 \u0993 \u0985\u09A7\u09BF\u0995\u09B0\u09A3 \u0995\u09BE\u09B0\u0995", "\u09AA\u09A4\u09CD\u09B0 \u0993 \u09AA\u09CD\u09B0\u09AC\u09A8\u09CD\u09A7 \u09B0\u099A\u09A8\u09BE"], TB_BN_7)
      ]
    },
    8: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_BN_8,
      syllabusVersion: "WBBSE Upper Primary Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Sahitya Mela, Bhashacharcha & Chhotoder Mahabharat Class VIII",
      boardNote: {
        en: "Official WBBSE Class VIII Sahitya Mela, Bhashacharcha & Chhotoder Mahabharat \u2014 All 12 Verified Units.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u0985\u09B7\u09CD\u099F\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE, \u09AD\u09BE\u09B7\u09BE\u099A\u09B0\u09CD\u099A\u09BE \u0993 \u099B\u09CB\u099F\u09A6\u09C7\u09B0 \u09AE\u09B9\u09BE\u09AD\u09BE\u09B0\u09A4 \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E8\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 8 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E, \u092D\u093E\u0937\u093E\u091A\u0930\u094D\u091A\u093E \u0914\u0930 \u091B\u094B\u091F\u094B\u0926\u0947\u0930 \u092E\u0939\u093E\u092D\u093E\u0930\u0924 \u2014 \u0938\u092D\u0940 12 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("bn8_c1", 1, "Sahitya Mela 1: \u09AC\u09CB\u099D\u09BE\u09AA\u09A1\u09BC\u09BE (Rabindranath Tagore) & \u0985\u09A6\u09CD\u09AD\u09C1\u09A4 \u0986\u09A4\u09BF\u09A5\u09C7\u09AF\u09BC\u09A4\u09BE (Ishwar Chandra Vidyasagar)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09E7: \u09AC\u09CB\u099D\u09BE\u09AA\u09A1\u09BC\u09BE (\u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u09A0\u09BE\u0995\u09C1\u09B0) \u0993 \u0985\u09A6\u09CD\u09AD\u09C1\u09A4 \u0986\u09A4\u09BF\u09A5\u09C7\u09AF\u09BC\u09A4\u09BE (\u0988\u09B6\u09CD\u09AC\u09B0\u099A\u09A8\u09CD\u09A6\u09CD\u09B0 \u09AC\u09BF\u09A6\u09CD\u09AF\u09BE\u09B8\u09BE\u0997\u09B0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 1: \u092C\u094B\u091D\u093E\u092A\u0921\u093C\u093E (\u0930\u0935\u0940\u0902\u0926\u094D\u0930\u0928\u093E\u0925 \u091F\u0948\u0917\u094B\u0930) \u0914\u0930 \u0905\u0926\u094D\u092D\u0941\u0924 \u0906\u0924\u093F\u0925\u0947\u092F\u0924\u093E (\u0908\u0936\u094D\u0935\u0930\u091A\u0902\u0926\u094D\u0930 \u0935\u093F\u0926\u094D\u092F\u093E\u0938\u093E\u0917\u0930)", ['"\u09AE\u09A8\u09C7\u09B0\u09C7 \u0986\u099C \u0995\u09B9 \u09AF\u09C7, \u09AD\u09BE\u09B2\u09CB \u09AE\u09A8\u09CD\u09A6 \u09AF\u09BE\u09B9\u09BE\u0987 \u0986\u09B8\u09C1\u0995 \u09B8\u09A4\u09CD\u09AF\u09C7\u09B0\u09C7 \u09B2\u0993 \u09B8\u09B9\u099C\u09C7"', "\u0986\u09B0\u09AC \u09B8\u09C7\u09A8\u09BE\u09AA\u09A4\u09BF \u0993 \u09AE\u09C1\u09B0 \u09B8\u09C7\u09A8\u09BE\u09AA\u09A4\u09BF\u09B0 \u0986\u09A4\u09BF\u09A5\u09C7\u09AF\u09BC\u09A4\u09BE \u0993 \u0989\u09A6\u09BE\u09B0\u09A4\u09BE"], TB_BN_8),
        ch("bn8_c2", 2, "Sahitya Mela 2: \u099A\u09A8\u09CD\u09A6\u09CD\u09B0\u0997\u09C1\u09AA\u09CD\u09A4 (Dwijendralal Ray) & \u09AC\u09A8\u09AD\u09CB\u099C\u09A8\u09C7\u09B0 \u09AC\u09CD\u09AF\u09BE\u09AA\u09BE\u09B0 (Narayan Gangopadhyay)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09E8: \u099A\u09A8\u09CD\u09A6\u09CD\u09B0\u0997\u09C1\u09AA\u09CD\u09A4 (\u09A6\u09CD\u09AC\u09BF\u099C\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0\u09B2\u09BE\u09B2 \u09B0\u09BE\u09AF\u09BC) \u0993 \u09AC\u09A8\u09AD\u09CB\u099C\u09A8\u09C7\u09B0 \u09AC\u09CD\u09AF\u09BE\u09AA\u09BE\u09B0 (\u09A8\u09BE\u09B0\u09BE\u09AF\u09BC\u09A3 \u0997\u0999\u09CD\u0997\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 2: \u091A\u0902\u0926\u094D\u0930\u0917\u0941\u092A\u094D\u0924 (\u0926\u094D\u0935\u093F\u091C\u0947\u0902\u0926\u094D\u0930\u0932\u093E\u0932 \u0930\u093E\u092F) \u0914\u0930 \u092C\u0928\u092D\u094B\u091C\u0928\u0947\u0930 \u0935\u094D\u092F\u093E\u092A\u093E\u0930 (\u0928\u093E\u0930\u093E\u092F\u0923 \u0917\u0902\u0917\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F)", ["\u0997\u09CD\u09B0\u09BF\u0995 \u09B8\u09AE\u09CD\u09B0\u09BE\u099F \u09B8\u09C7\u09B2\u09BF\u0989\u0995\u09BE\u09B8 \u0993 \u099A\u09A8\u09CD\u09A6\u09CD\u09B0\u0997\u09C1\u09AA\u09CD\u09A4 \u09AE\u09CC\u09B0\u09CD\u09AF\u09C7\u09B0 \u09AF\u09C1\u09A6\u09CD\u09A7 \u0993 \u09AE\u09C8\u09A4\u09CD\u09B0\u09C0", "\u099F\u09C7\u09A8\u09BF\u09A6\u09BE, \u0995\u09CD\u09AF\u09BE\u09AC\u09B2\u09BE, \u09B9\u09BE\u09AC\u09C1\u09B2 \u0993 \u09AA\u09CD\u09AF\u09BE\u0981\u09B2\u09BE\u09B0 \u09AC\u09A8\u09AD\u09CB\u099C\u09A8 \u0993 \u09B9\u09A8\u09C1\u09AE\u09BE\u09A8\u09C7\u09B0 \u09B9\u09BE\u09A8\u09BE"], TB_BN_8),
        ch("bn8_c3", 3, "Sahitya Mela 3: \u09B8\u09AC\u09C1\u099C \u099C\u09BE\u09AE\u09BE (Birendra Chattopadhyay) & \u099A\u09BF\u09A0\u09BF (Michael Madhusudan Dutt, Rabindranath, Subhas Chandra Bose)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09E9: \u09B8\u09AC\u09C1\u099C \u099C\u09BE\u09AE\u09BE (\u09AC\u09C0\u09B0\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0 \u099A\u099F\u09CD\u099F\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC) \u0993 \u099A\u09BF\u09A0\u09BF (\u09AE\u09A7\u09C1\u09B8\u09C2\u09A6\u09A8, \u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5, \u09B8\u09C1\u09AD\u09BE\u09B7\u099A\u09A8\u09CD\u09A6\u09CD\u09B0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 3: \u0938\u092C\u0941\u091C \u091C\u093E\u092E\u093E (\u0935\u0940\u0930\u0947\u0902\u0926\u094D\u0930 \u091A\u091F\u094D\u091F\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F) \u0914\u0930 \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u092A\u0924\u094D\u0930", ["\u09A4\u09CB\u09A4\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u09AA\u09CD\u09B0\u0995\u09C3\u09A4\u09BF\u09B0 \u09AE\u09A4\u09CB \u09B8\u09AC\u09C1\u099C \u099C\u09BE\u09AE\u09BE \u099A\u09BE\u0993\u09AF\u09BC\u09BE", "\u09B0\u09BE\u099C\u09A8\u09BE\u09B0\u09BE\u09AF\u09BC\u09A3 \u09AC\u09B8\u09C1\u0995\u09C7 \u09AE\u09A7\u09C1\u09B8\u09C2\u09A6\u09A8, \u09A6\u09C0\u09A8\u09C7\u09B6\u099A\u09A8\u09CD\u09A6\u09CD\u09B0 \u09B8\u09C7\u09A8\u0995\u09C7 \u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u0993 \u098F\u09A8. \u09B8\u09BF. \u0995\u09C7\u09B2\u0995\u09BE\u09B0\u0995\u09C7 \u09B8\u09C1\u09AD\u09BE\u09B7\u099A\u09A8\u09CD\u09A6\u09CD\u09B0\u09C7\u09B0 \u099A\u09BF\u09A0\u09BF"], TB_BN_8),
        ch("bn8_c4", 4, "Sahitya Mela 4: \u09AA\u09B0\u09AC\u09BE\u09B8\u09C0 (Bishnu Dey) & \u09AA\u09A5\u099A\u09B2\u09A4\u09BF (Suniti Kumar Chatterji)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EA: \u09AA\u09B0\u09AC\u09BE\u09B8\u09C0 (\u09AC\u09BF\u09B7\u09CD\u09A3\u09C1 \u09A6\u09C7) \u0993 \u09AA\u09A5\u099A\u09B2\u09A4\u09BF (\u09B8\u09C1\u09A8\u09C0\u09A4\u09BF\u0995\u09C1\u09AE\u09BE\u09B0 \u099A\u099F\u09CD\u099F\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 4: \u092A\u0930\u092C\u093E\u0938\u0940 (\u0935\u093F\u0937\u094D\u0923\u0941 \u0926\u0947) \u0914\u0930 \u092A\u0925\u091A\u0932\u0924\u093F (\u0938\u0941\u0928\u0940\u0924\u093F\u0915\u0941\u092E\u093E\u0930 \u091A\u091F\u094D\u091F\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F)", ["\u09AC\u09A8 \u0993 \u09AC\u09A8\u09CD\u09AF\u09AA\u09CD\u09B0\u09BE\u09A3 \u09A7\u09CD\u09AC\u0982\u09B8\u09C7\u09B0 \u09AC\u09BF\u09B0\u09C1\u09A6\u09CD\u09A7\u09C7 \u0986\u09B0\u09CD\u09A4\u09BF", "\u09A6\u09C7\u09B9\u09B0\u09BE\u09A6\u09C2\u09A8 \u098F\u0995\u09CD\u09B8\u09AA\u09CD\u09B0\u09C7\u09B8\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8 \u09B8\u09B9\u09AF\u09BE\u09A4\u09CD\u09B0\u09C0\u09A6\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AD\u09BE\u09B7\u09BE \u0993 \u09B8\u0982\u09B8\u09CD\u0995\u09C3\u09A4\u09BF\u09B0 \u09AE\u09C7\u09B2\u09AC\u09A8\u09CD\u09A7\u09A8"], TB_BN_8),
        ch("bn8_c5", 5, "Sahitya Mela 5: \u098F\u0995\u099F\u09BF \u099A\u09A1\u09BC\u09C1\u0987 \u09AA\u09BE\u0996\u09BF (Tarapada Roy) & \u09AA\u09B2\u09CD\u09B2\u09BF-\u09B8\u09AE\u09BE\u099C (Sarat Chandra Chattopadhyay)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EB: \u098F\u0995\u099F\u09BF \u099A\u09A1\u09BC\u09C1\u0987 \u09AA\u09BE\u0996\u09BF (\u09A4\u09BE\u09B0\u09BE\u09AA\u09A6 \u09B0\u09BE\u09AF\u09BC) \u0993 \u09AA\u09B2\u09CD\u09B2\u09BF-\u09B8\u09AE\u09BE\u099C (\u09B6\u09B0\u09CE\u099A\u09A8\u09CD\u09A6\u09CD\u09B0 \u099A\u099F\u09CD\u099F\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 5: \u090F\u0915\u091F\u093F \u091A\u0921\u093C\u0941\u0908 \u092A\u093E\u0916\u093F (\u0924\u093E\u0930\u093E\u092A\u0926 \u0930\u093E\u092F) \u0914\u0930 \u092A\u0932\u094D\u0932\u093F-\u0938\u092E\u093E\u091C (\u0936\u0930\u0924\u094D\u091A\u0902\u0926\u094D\u0930 \u091A\u091F\u094D\u091F\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F)", ["\u0995\u09AC\u09BF\u09B0 \u0998\u09B0\u09C7 \u099A\u09A1\u09BC\u09C1\u0987 \u09AA\u09BE\u0996\u09BF\u09B0 \u09AC\u09BE\u09B8\u09BE \u0993 \u09B8\u09B9\u09BE\u09AC\u09B8\u09CD\u09A5\u09BE\u09A8", "\u09B0\u09AE\u09C7\u09B6, \u09B0\u09AE\u09BE, \u0986\u0995\u09AC\u09B0 \u0993 \u0997\u09CB\u09AA\u09BE\u09B2 \u09B8\u09B0\u0995\u09BE\u09B0\u09C7\u09B0 \u098F\u0995\u09B6\u09CB \u09AC\u09BF\u0998\u09BE\u09B0 \u09AC\u09BE\u0981\u09A7 \u0995\u09BE\u099F\u09BE\u09B0 \u09AE\u09BE\u09A8\u09AC\u09BF\u0995 \u09B8\u0982\u0998\u09BE\u09A4"], TB_BN_8),
        ch("bn8_c6", 6, "Sahitya Mela 6: \u09A6\u09BE\u0981\u09A1\u09BC\u09BE\u0993 (Shakti Chattopadhyay), \u099B\u09A8\u09CD\u09A8\u099B\u09BE\u09A1\u09BC\u09BE (Achintyakumar Sengupta) & \u0997\u09BE\u099B\u09C7\u09B0 \u0995\u09A5\u09BE (Jagadish Chandra Bose)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EC: \u09A6\u09BE\u0981\u09A1\u09BC\u09BE\u0993 (\u09B6\u0995\u09CD\u09A4\u09BF \u099A\u099F\u09CD\u099F\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC), \u099B\u09A8\u09CD\u09A8\u099B\u09BE\u09A1\u09BC\u09BE \u0993 \u0997\u09BE\u099B\u09C7\u09B0 \u0995\u09A5\u09BE (\u099C\u0997\u09A6\u09C0\u09B6\u099A\u09A8\u09CD\u09A6\u09CD\u09B0 \u09AC\u09B8\u09C1)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 6: \u0926\u093E\u0901\u0921\u093C\u093E\u0913 (\u0936\u0915\u094D\u0924\u093F \u091A\u091F\u094D\u091F\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F), \u091B\u0928\u094D\u0928\u091B\u093E\u0921\u093C\u093E \u0914\u0930 \u0917\u093E\u091B\u0947\u0930 \u0915\u0925\u093E (\u091C\u0917\u0926\u0940\u0936 \u091A\u0902\u0926\u094D\u0930 \u092C\u0938\u0941)", ["\u09AE\u09BE\u09A8\u09C1\u09B7\u09C7\u09B0 \u09AA\u09BE\u09B6\u09C7 \u09A6\u09BE\u0981\u09A1\u09BC\u09BE\u09A8\u09CB\u09B0 \u0986\u09B9\u09CD\u09AC\u09BE\u09A8", "\u0989\u09A6\u09CD\u09AD\u09BF\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BE\u09A3, \u09B8\u0982\u09AC\u09C7\u09A6\u09A8\u09B6\u09C0\u09B2\u09A4\u09BE \u0993 \u09AC\u09C0\u099C\u09C7\u09B0 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0"], TB_BN_8),
        ch("bn8_c7", 7, "Sahitya Mela 7: \u09B9\u09BE\u0993\u09AF\u09BC\u09BE\u09B0 \u0997\u09BE\u09A8 (Buddhadeva Bose) & \u0995\u09C0 \u0995\u09B0\u09C7 \u09AC\u09C1\u099D\u09AC (Ashapurna Devi)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09ED: \u09B9\u09BE\u0993\u09AF\u09BC\u09BE\u09B0 \u0997\u09BE\u09A8 (\u09AC\u09C1\u09A6\u09CD\u09A7\u09A6\u09C7\u09AC \u09AC\u09B8\u09C1) \u0993 \u0995\u09C0 \u0995\u09B0\u09C7 \u09AC\u09C1\u099D\u09AC (\u0986\u09B6\u09BE\u09AA\u09C2\u09B0\u09CD\u09A3\u09BE \u09A6\u09C7\u09AC\u09C0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 7: \u0939\u093E\u0935\u093E\u0930 \u0917\u093E\u0928 (\u092C\u0941\u0926\u094D\u0927\u0926\u0947\u0935 \u092C\u0938\u0941) \u0914\u0930 \u0915\u0940 \u0915\u0930\u0947 \u092C\u0941\u091D\u092C (\u0906\u0936\u093E\u092A\u0942\u0930\u094D\u0923\u093E \u0926\u0947\u0935\u0940)", ["\u09AA\u09C3\u09A5\u09BF\u09AC\u09C0 \u099C\u09C1\u09A1\u09BC\u09C7 \u09AC\u09BE\u09A4\u09BE\u09B8\u09C7\u09B0 \u099A\u09BF\u09B0\u09A8\u09CD\u09A4\u09A8 \u0985\u09A8\u09C1\u09B8\u09A8\u09CD\u09A7\u09BE\u09A8", "\u09AC\u0995\u09C1\u09B2 \u0993 \u099B\u09AE\u09BF\u09B0\u09C7\u09B0 \u0996\u09C7\u09B2\u09BE\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u09A6\u09BF\u09AF\u09BC\u09C7 \u09AD\u09C7\u09A6\u09BE\u09AD\u09C7\u09A6 \u0993 \u0985\u09B9\u0982\u0995\u09BE\u09B0\u09C7\u09B0 \u0985\u09B8\u09BE\u09B0\u09A4\u09BE"], TB_BN_8),
        ch("bn8_c8", 8, "Sahitya Mela 8: \u09AA\u09BE\u09A1\u09BC\u09BE\u0997\u09BE\u0981\u09AF\u09BC\u09C7\u09B0 \u09A6\u09C1-\u09AA\u09CD\u09B0\u09B9\u09B0 \u09AD\u09BE\u09B2\u09CB\u09AC\u09BE\u09B8\u09BF (Jibanananda Das) & \u09A8\u09BE\u099F\u09CB\u09B0\u09C7\u09B0 \u0995\u09A5\u09BE (Abanindranath Tagore)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EE: \u09AA\u09BE\u09A1\u09BC\u09BE\u0997\u09BE\u0981\u09AF\u09BC\u09C7\u09B0 \u09A6\u09C1-\u09AA\u09CD\u09B0\u09B9\u09B0 \u09AD\u09BE\u09B2\u09CB\u09AC\u09BE\u09B8\u09BF (\u099C\u09C0\u09AC\u09A8\u09BE\u09A8\u09A8\u09CD\u09A6 \u09A6\u09BE\u09B6) \u0993 \u09A8\u09BE\u099F\u09CB\u09B0\u09C7\u09B0 \u0995\u09A5\u09BE (\u0985\u09AC\u09A8\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u09A0\u09BE\u0995\u09C1\u09B0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 8: \u092A\u093E\u0921\u093C\u093E\u0917\u093E\u0901\u092F\u0947\u0930 \u0926\u0941-\u092A\u094D\u0930\u0939\u0930 \u092D\u093E\u0932\u094B\u092C\u093E\u0938\u093F (\u091C\u0940\u0935\u0928\u093E\u0928\u0902\u0926 \u0926\u093E\u0938) \u0914\u0930 \u0928\u093E\u091F\u094B\u0930\u0947\u0930 \u0915\u0925\u093E (\u0905\u0935\u0928\u0940\u0902\u0926\u094D\u0930\u0928\u093E\u0925 \u091F\u0948\u0917\u094B\u0930)", ["\u09B0\u09C2\u09AA\u09B8\u09C0 \u09AC\u09BE\u0982\u09B2\u09BE\u09B0 \u09A8\u09BF\u09B8\u09CD\u09A4\u09AC\u09CD\u09A7 \u09A6\u09C1\u09AA\u09C1\u09B0, \u099C\u09B2\u09B8\u09BF\u0981\u09A1\u09BC\u09BF \u09A8\u09A6\u09C0 \u0993 \u09B6\u0999\u09CD\u0996\u099A\u09BF\u09B2", "\u09A8\u09BE\u099F\u09CB\u09B0 \u09AA\u09CD\u09B0\u09BE\u09A6\u09C7\u09B6\u09BF\u0995 \u09B8\u09AE\u09CD\u09AE\u09C7\u09B2\u09A8\u09C7 \u09AD\u09C2\u09AE\u09BF\u0995\u09AE\u09CD\u09AA \u0993 \u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE\u09AF\u09BC \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09BE\u09AC \u09AA\u09BE\u09A0"], TB_BN_8),
        ch("bn8_c9", 9, "Sahitya Mela 9: \u0997\u09A1\u09BC\u09BE\u0987 \u09A8\u09A6\u09C0\u09B0 \u09A4\u09C0\u09B0\u09C7 (Jasimuddin), \u099C\u09C7\u09B2\u0996\u09BE\u09A8\u09BE\u09B0 \u099A\u09BF\u09A0\u09BF (Subhas Chandra Bose) & \u09B2\u09CB\u0995\u099F\u09BE \u099C\u09BE\u09A8\u09B2\u0987 \u09A8\u09BE (Subhash Mukhopadhyay)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AE\u09C7\u09B2\u09BE \u09EF: \u0997\u09A1\u09BC\u09BE\u0987 \u09A8\u09A6\u09C0\u09B0 \u09A4\u09C0\u09B0\u09C7 (\u099C\u09B8\u09C0\u09AE\u0989\u09A6\u09CD\u09A6\u09C0\u09A8), \u099C\u09C7\u09B2\u0996\u09BE\u09A8\u09BE\u09B0 \u099A\u09BF\u09A0\u09BF \u0993 \u09B2\u09CB\u0995\u099F\u09BE \u099C\u09BE\u09A8\u09B2\u0987 \u09A8\u09BE", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u092E\u0947\u0932\u093E 9: \u0917\u0921\u093C\u093E\u0908 \u0928\u0926\u0940\u0930 \u0924\u0940\u0930\u0947 (\u091C\u0938\u0940\u092E\u0909\u0926\u094D\u0926\u0940\u0928), \u091C\u0947\u0932\u0916\u093E\u0928\u093E\u0930 \u091A\u093F\u0920\u093F (\u0938\u0941\u092D\u093E\u0937 \u091A\u0902\u0926\u094D\u0930 \u092C\u094B\u0938) \u0914\u0930 \u0932\u094B\u0915\u091F\u093E \u091C\u093E\u0928\u0932\u0908 \u0928\u093E", ["\u09AE\u09BE\u09A8\u09CD\u09A6\u09BE\u09B2\u09AF\u09BC \u099C\u09C7\u09B2 \u09A5\u09C7\u0995\u09C7 \u0995\u09C7\u09B2\u0995\u09BE\u09B0\u0995\u09C7 \u09B2\u09C7\u0996\u09BE \u09A8\u09C7\u09A4\u09BE\u099C\u09BF\u09B0 \u099A\u09BF\u09A0\u09BF \u0993 \u09A6\u09C7\u09B6\u09AC\u09A8\u09CD\u09A7\u09C1 \u099A\u09BF\u09A4\u09CD\u09A4\u09B0\u099E\u09CD\u099C\u09A8 \u09A6\u09BE\u09B6\u09C7\u09B0 \u09B8\u09CD\u09AE\u09C3\u09A4\u09BF\u099A\u09BE\u09B0\u09A3"], TB_BN_8),
        ch("bn8_c10", 10, "Supplementary Reader: \u099B\u09CB\u099F\u09A6\u09C7\u09B0 \u09AE\u09B9\u09BE\u09AD\u09BE\u09B0\u09A4 (Upendrakishore Raychaudhuri)", "\u09B8\u09B9\u09BE\u09AF\u09BC\u0995 \u09AA\u09BE\u09A0: \u099B\u09CB\u099F\u09A6\u09C7\u09B0 \u09AE\u09B9\u09BE\u09AD\u09BE\u09B0\u09A4 (\u0989\u09AA\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0\u0995\u09BF\u09B6\u09CB\u09B0 \u09B0\u09BE\u09AF\u09BC\u099A\u09CC\u09A7\u09C1\u09B0\u09C0)", "\u0938\u0939\u093E\u092F\u0915 \u092A\u093E\u0920: \u091B\u094B\u091F\u094B\u0926\u0947\u0930 \u092E\u0939\u093E\u092D\u093E\u0930\u0924 (\u0909\u092A\u0947\u0928\u094D\u0926\u094D\u0930\u0915\u093F\u0936\u094B\u0930 \u0930\u093E\u092F\u091A\u094C\u0927\u0941\u0930\u0940)", ["\u0986\u09A6\u09BF\u09AA\u09B0\u09CD\u09AC \u09A5\u09C7\u0995\u09C7 \u09B8\u09CD\u09AC\u09B0\u09CD\u0997\u09BE\u09B0\u09CB\u09B9\u09A3 \u09AA\u09B0\u09CD\u09AC: \u09AD\u09C0\u09B7\u09CD\u09AE\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u099C\u09CD\u099E\u09BE, \u099C\u09A4\u09C1\u0997\u09C3\u09B9, \u09A6\u09CD\u09B0\u09CC\u09AA\u09A6\u09C0\u09B0 \u09B8\u09CD\u09AC\u09AF\u09BC\u0982\u09AC\u09B0, \u09AA\u09BE\u09B6\u09BE\u0996\u09C7\u09B2\u09BE, \u0985\u099C\u09CD\u099E\u09BE\u09A4\u09AC\u09BE\u09B8, \u0995\u09C1\u09B0\u09C1\u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09C7\u09B0 \u09AF\u09C1\u09A6\u09CD\u09A7 \u0993 \u0985\u09AD\u09BF\u09AE\u09A8\u09CD\u09AF\u09C1 \u09AC\u09A7"], TB_BN_8),
        ch("bn8_c11", 11, "Bhashacharcha 1: \u09A6\u09B2 (Syllable), \u09A7\u09CD\u09AC\u09A8\u09BF \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8\u09C7\u09B0 \u09A7\u09BE\u09B0\u09BE (\u0985\u09AA\u09BF\u09A8\u09BF\u09B9\u09BF\u09A4\u09BF, \u09B8\u09CD\u09AC\u09B0\u09AD\u0995\u09CD\u09A4\u09BF, \u0985\u09AD\u09BF\u09B6\u09CD\u09B0\u09C1\u09A4\u09BF, \u09B8\u09CD\u09AC\u09B0\u09B8\u0982\u0997\u09A4\u09BF) \u0993 \u09B8\u09AE\u09BE\u09B8 (\u09AA\u09CD\u09B0\u09BE\u09A5\u09AE\u09BF\u0995)", "\u09AD\u09BE\u09B7\u09BE\u099A\u09B0\u09CD\u099A\u09BE \u09E7: \u09A6\u09B2 (\u09AE\u09C1\u0995\u09CD\u09A4\u09A6\u09B2 \u0993 \u09B0\u09C1\u09A6\u09CD\u09A7\u09A6\u09B2) \u098F\u09AC\u0982 \u09A7\u09CD\u09AC\u09A8\u09BF \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8\u09C7\u09B0 \u09A7\u09BE\u09B0\u09BE", "\u092D\u093E\u0937\u093E\u091A\u0930\u094D\u091A\u093E 1: \u0926\u0932 (\u0905\u0915\u094D\u0937\u0930) \u0914\u0930 \u0927\u094D\u0935\u0928\u093F \u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928 \u0915\u0940 \u0927\u093E\u0930\u093E\u090F\u0901", ["\u09AE\u09C1\u0995\u09CD\u09A4\u09A6\u09B2 \u0993 \u09B0\u09C1\u09A6\u09CD\u09A7\u09A6\u09B2 \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3", "\u09B8\u09CD\u09AC\u09B0\u09BE\u0997\u09AE, \u09B8\u09CD\u09AC\u09B0\u09B2\u09CB\u09AA, \u0985\u09AA\u09BF\u09A8\u09BF\u09B9\u09BF\u09A4\u09BF, \u0985\u09AD\u09BF\u09B6\u09CD\u09B0\u09C1\u09A4\u09BF, \u09B8\u09AE\u09C0\u09AD\u09AC\u09A8, \u09AC\u09BF\u09B7\u09AE\u09C0\u09AD\u09AC\u09A8"], TB_BN_8),
        ch("bn8_c12", 12, "Bhashacharcha 2: \u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u09B0 \u0995\u09BE\u09B2 \u0993 \u09AD\u09BE\u09AC, \u09AC\u09BE\u0995\u09CD\u09AF\u09C7\u09B0 \u0997\u09A0\u09A8\u0997\u09A4 \u0993 \u0985\u09B0\u09CD\u09A5\u0997\u09A4 \u09B6\u09CD\u09B0\u09C7\u09A3\u09C0\u09AC\u09BF\u09AD\u09BE\u0997 \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u09AC\u09A8\u09CD\u09A7/\u09AA\u09A4\u09CD\u09B0 \u09B0\u099A\u09A8\u09BE", "\u09AD\u09BE\u09B7\u09BE\u099A\u09B0\u09CD\u099A\u09BE \u09E8: \u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u09B0 \u0995\u09BE\u09B2 \u0993 \u09AD\u09BE\u09AC, \u09AC\u09BE\u0995\u09CD\u09AF\u09C7\u09B0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09C0\u09AC\u09BF\u09AD\u09BE\u0997 \u0993 \u09A8\u09BF\u09B0\u09CD\u09AE\u09BF\u09A4\u09BF", "\u092D\u093E\u0937\u093E\u091A\u0930\u094D\u091A\u093E 2: \u0915\u094D\u0930\u093F\u092F\u093E \u0915\u0947 \u0915\u093E\u0932 \u0914\u0930 \u092D\u093E\u0935, \u0935\u093E\u0915\u094D\u092F \u0915\u0947 \u092D\u0947\u0926 \u0914\u0930 \u092A\u0924\u094D\u0930/\u0928\u093F\u092C\u0902\u0927 \u0932\u0947\u0916\u0928", ["\u09B8\u09B0\u09B2, \u099C\u099F\u09BF\u09B2 \u0993 \u09AF\u09CC\u0997\u09BF\u0995 \u09AC\u09BE\u0995\u09CD\u09AF; \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u0995, \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09AC\u09CB\u09A7\u0995, \u0985\u09A8\u09C1\u099C\u09CD\u099E\u09BE\u09B8\u09C2\u099A\u0995, \u09AA\u09CD\u09B0\u09BE\u09B0\u09CD\u09A5\u09A8\u09BE\u09B8\u09C2\u099A\u0995, \u09AC\u09BF\u09B8\u09CD\u09AE\u09AF\u09BC\u09B8\u09C2\u099A\u0995 \u09AC\u09BE\u0995\u09CD\u09AF"], TB_BN_8)
      ]
    },
    9: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_BN_9,
      syllabusVersion: "WBBSE Secondary Curriculum (Current Edition)",
      officialSource: "WBBSE \u2014 Sahitya Sanchayan, Bhasha Path & Professor Shonku Class IX",
      boardNote: {
        en: "Official WBBSE Class IX Sahitya Sanchayan, Bhasha Path & Professor Shonku \u2014 All 12 Verified Units.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8, \u09AD\u09BE\u09B7\u09BE\u09AA\u09BE\u09A0 \u0993 \u09AA\u09CD\u09B0\u09AB\u09C7\u09B8\u09B0 \u09B6\u0999\u09CD\u0995\u09C1\u09B0 \u09A1\u09BE\u09AF\u09BC\u09C7\u09B0\u09BF \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E8\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 9 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928, \u092D\u093E\u0937\u093E\u092A\u093E\u0920 \u0914\u0930 \u092A\u094D\u0930\u094B\u092B\u093C\u0947\u0938\u0930 \u0936\u0902\u0915\u0941 \u2014 \u0938\u092D\u0940 12 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("bn9_c1", 1, "Sahitya Sanchayan 1: \u0995\u09B2\u09BF\u0999\u09CD\u0997\u09A6\u09C7\u09B6\u09C7 \u099D\u09A1\u09BC-\u09AC\u09C3\u09B7\u09CD\u099F\u09BF (Mukundaram Chakravarti) & \u09A7\u09C0\u09AC\u09B0-\u09AC\u09C3\u09A4\u09CD\u09A4\u09BE\u09A8\u09CD\u09A4 (Kalidasa / Satyendranath Tagore)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09E7: \u0995\u09B2\u09BF\u0999\u09CD\u0997\u09A6\u09C7\u09B6\u09C7 \u099D\u09A1\u09BC-\u09AC\u09C3\u09B7\u09CD\u099F\u09BF (\u09AE\u09C1\u0995\u09C1\u09A8\u09CD\u09A6\u09B0\u09BE\u09AE \u099A\u0995\u09CD\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0) \u0993 \u09A7\u09C0\u09AC\u09B0-\u09AC\u09C3\u09A4\u09CD\u09A4\u09BE\u09A8\u09CD\u09A4 (\u0995\u09BE\u09B2\u09BF\u09A6\u09BE\u09B8)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 1: \u0915\u0932\u093F\u0902\u0917\u0926\u0947\u0936\u0947 \u091D\u0921\u093C-\u0935\u0943\u0937\u094D\u091F\u093F (\u092E\u0941\u0915\u0941\u0902\u0926\u0930\u093E\u092E \u091A\u0915\u094D\u0930\u0935\u0930\u094D\u0924\u0940) \u0914\u0930 \u0927\u0940\u0935\u0930-\u0935\u0943\u0924\u094D\u0924\u093E\u0902\u0924 (\u0915\u093E\u0932\u093F\u0926\u093E\u0938)", ["\u099A\u09A3\u09CD\u09A1\u09C0\u09AE\u0999\u09CD\u0997\u09B2 \u0995\u09BE\u09AC\u09CD\u09AF\u09C7\u09B0 \u09A6\u09C7\u09AC\u09C0 \u099A\u09A3\u09CD\u09A1\u09C0\u09B0 \u0986\u09A6\u09C7\u09B6\u09C7 \u0995\u09B2\u09BF\u0999\u09CD\u0997\u09C7 \u09B8\u09BE\u09A4 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AA\u09CD\u09B0\u09B2\u09AF\u09BC\u0999\u09CD\u0995\u09B0\u09C0 \u099D\u09A1\u09BC\u09AC\u09C3\u09B7\u09CD\u099F\u09BF \u0993 \u099C\u09C8\u09AE\u09BF\u09A8\u09BF \u09B8\u09CD\u09AE\u09B0\u09A3", "\u0985\u09AD\u09BF\u099C\u09CD\u099E\u09BE\u09A8\u09B6\u0995\u09C1\u09A8\u09CD\u09A4\u09B2\u09AE\u09CD \u09A8\u09BE\u099F\u0995\u09C7\u09B0 \u09B0\u09C1\u0987 \u09AE\u09BE\u099B\u09C7\u09B0 \u09AA\u09C7\u099F \u09A5\u09C7\u0995\u09C7 \u09B0\u09BE\u099C\u09BE \u09A6\u09C1\u09B7\u09CD\u09AE\u09A8\u09CD\u09A4\u09C7\u09B0 \u09A8\u09BE\u09AE\u09BE\u0999\u09CD\u0995\u09BF\u09A4 \u0986\u0982\u099F\u09BF \u0989\u09A6\u09CD\u09A7\u09BE\u09B0"], TB_BN_9),
        ch("bn9_c2", 2, "Sahitya Sanchayan 2: \u0987\u09B2\u09BF\u09AF\u09BC\u09BE\u09B8 (Leo Tolstoy / Manindralal Basu) & \u09A6\u09BE\u09AE (Narayan Gangopadhyay)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09E8: \u0987\u09B2\u09BF\u09AF\u09BC\u09BE\u09B8 (\u09B2\u09BF\u0993 \u09A4\u09B2\u09B8\u09CD\u09A4\u09AF\u09BC) \u0993 \u09A6\u09BE\u09AE (\u09A8\u09BE\u09B0\u09BE\u09AF\u09BC\u09A3 \u0997\u0999\u09CD\u0997\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 2: \u0907\u0932\u093F\u092F\u093E\u0938 (\u0932\u093F\u092F\u094B \u091F\u0949\u0932\u094D\u0938\u094D\u091F\u0949\u092F) \u0914\u0930 \u0926\u093E\u092E (\u0928\u093E\u0930\u093E\u092F\u0923 \u0917\u0902\u0917\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F)", ["\u0989\u09AB\u09BE \u09AA\u09CD\u09B0\u09A6\u09C7\u09B6\u09C7\u09B0 \u09AC\u09BE\u09B8\u0995\u09BF\u09B0 \u0987\u09B2\u09BF\u09AF\u09BC\u09BE\u09B8 \u0993 \u09B6\u09BE\u09AE-\u09B6\u09C7\u09AE\u09BE\u0997\u09BF\u09B0 \u09AA\u09CD\u09B0\u0995\u09C3\u09A4 \u09B8\u09C1\u0996\u09C7\u09B0 \u0989\u09AA\u09B2\u09AC\u09CD\u09A7\u09BF", "\u09B8\u09C1\u0995\u09C1\u09AE\u09BE\u09B0 \u0993 \u09A4\u09BE\u0981\u09B0 \u0985\u0999\u09CD\u0995\u09C7\u09B0 \u09AE\u09BE\u09B8\u09CD\u099F\u09BE\u09B0\u09AE\u09B6\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u09B8\u09CD\u09A8\u09C7\u09B9 \u0993 \u0995\u09CD\u09B7\u09AE\u09BE\u09B0 \u0985\u09AE\u09C2\u09B2\u09CD\u09AF \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995"], TB_BN_9),
        ch("bn9_c3", 3, "Sahitya Sanchayan 3: \u09A8\u09CB\u0999\u09B0 (Ajit Datta) & \u0986\u0995\u09BE\u09B6\u09C7\u09B0 \u09B8\u09BE\u09A4\u099F\u09BF \u09A4\u09BE\u09B0\u09BE (Jibanananda Das)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09E9: \u09A8\u09CB\u0999\u09B0 (\u0985\u099C\u09BF\u09CE \u09A6\u09A4\u09CD\u09A4) \u0993 \u0986\u0995\u09BE\u09B6\u09C7\u09B0 \u09B8\u09BE\u09A4\u099F\u09BF \u09A4\u09BE\u09B0\u09BE (\u099C\u09C0\u09AC\u09A8\u09BE\u09A8\u09A8\u09CD\u09A6 \u09A6\u09BE\u09B6)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 3: \u0928\u094B\u0919\u0930 (\u0905\u091C\u093F\u0924 \u0926\u0924\u094D\u0924) \u0914\u0930 \u0906\u0915\u093E\u0936\u0947\u0930 \u0938\u093E\u0924\u091F\u093F \u0924\u093E\u0930\u093E (\u091C\u0940\u0935\u0928\u093E\u0928\u0902\u0926 \u0926\u093E\u0938)", ["\u09A4\u099F\u09BF\u09A8\u09C0\u09B0 \u09A4\u09C0\u09B0\u09C7 \u09A8\u09CB\u0999\u09B0-\u09AC\u09BE\u0981\u09A7\u09BE \u09A4\u09B0\u09A3\u09C0 \u0993 \u09A6\u09C2\u09B0 \u09B8\u09BF\u09A8\u09CD\u09A7\u09C1\u09B0 \u0986\u09B9\u09CD\u09AC\u09BE\u09A8", "\u09B0\u09C2\u09AA\u09B8\u09C0 \u09AC\u09BE\u0982\u09B2\u09BE\u09B0 \u09B8\u09A8\u09CD\u09A7\u09CD\u09AF\u09BE, \u0995\u09BE\u09AE\u09B0\u09BE\u0999\u09BE-\u09B2\u09BE\u09B2 \u09AE\u09C7\u0998, \u0995\u09C7\u09B6\u09AC\u09A4\u09C0 \u0995\u09A8\u09CD\u09AF\u09BE \u0993 \u09B9\u09BF\u099C\u09B2-\u0995\u09BE\u0981\u09A0\u09BE\u09B2-\u099C\u09BE\u09AE\u09C7\u09B0 \u09B0\u09C2\u09AA"], TB_BN_9),
        ch("bn9_c4", 4, "Sahitya Sanchayan 4: \u09A8\u09AC \u09A8\u09AC \u09B8\u09C3\u09B7\u09CD\u099F\u09BF (Syed Mujtaba Ali) & \u09B9\u09BF\u09AE\u09BE\u09B2\u09AF\u09BC \u09A6\u09B0\u09CD\u09B6\u09A8 (Begum Rokeya)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09EA: \u09A8\u09AC \u09A8\u09AC \u09B8\u09C3\u09B7\u09CD\u099F\u09BF (\u09B8\u09C8\u09AF\u09BC\u09A6 \u09AE\u09C1\u099C\u09A4\u09AC\u09BE \u0986\u09B2\u09C0) \u0993 \u09B9\u09BF\u09AE\u09BE\u09B2\u09AF\u09BC \u09A6\u09B0\u09CD\u09B6\u09A8 (\u09AC\u09C7\u0997\u09AE \u09B0\u09CB\u0995\u09C7\u09AF\u09BC\u09BE)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 4: \u0928\u092C \u0928\u092C \u0938\u0943\u0937\u094D\u091F\u093F (\u0938\u0948\u092F\u0926 \u092E\u0941\u091C\u0924\u092C\u093E \u0905\u0932\u0940) \u0914\u0930 \u0939\u093F\u092E\u093E\u0932\u092F \u0926\u0930\u094D\u0936\u0928 (\u092C\u0947\u0917\u092E \u0930\u0941\u0915\u0948\u092F\u093E)", ["\u09B8\u0982\u09B8\u09CD\u0995\u09C3\u09A4 \u0993 \u0986\u09B0\u09AC\u09BF-\u09AB\u09BE\u09B0\u09B8\u09BF \u09AD\u09BE\u09B7\u09BE\u09B0 \u09B8\u09CD\u09AC\u09AF\u09BC\u0982\u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3\u09A4\u09BE \u0993 \u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE\u09B0 \u0997\u09CD\u09B0\u09B9\u09A3\u09B6\u09C0\u09B2\u09A4\u09BE", "\u0995\u09BE\u09B0\u09CD\u09B8\u09BF\u09AF\u09BC\u09BE\u0982 \u09AF\u09BE\u09A4\u09CD\u09B0\u09BE\u09AA\u09A5\u09C7 \u09B9\u09BF\u09AE\u09BE\u09B2\u09AF\u09BC\u09C7\u09B0 \u099C\u09B2\u09AA\u09CD\u09B0\u09AA\u09BE\u09A4, \u09A2\u09C7\u0981\u0995\u09BF\u09B6\u09BE\u0995 \u0993 \u09AD\u09C1\u099F\u09BF\u09AF\u09BC\u09BE \u09A8\u09BE\u09B0\u09C0\u09A6\u09C7\u09B0 \u09B6\u09CD\u09B0\u09AE\u09B6\u09C0\u09B2\u09A4\u09BE\u09B0 \u09AC\u09B0\u09CD\u09A3\u09A8\u09BE"], TB_BN_9),
        ch("bn9_c5", 5, "Sahitya Sanchayan 5: \u09B0\u09BE\u09A7\u09BE\u09B0\u09BE\u09A8\u09C0 (Bankim Chandra Chattopadhyay) & \u09A8\u09BF\u09B0\u09C1\u09A6\u09CD\u09A6\u09C7\u09B6 (Premendra Mitra)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09EB: \u09B0\u09BE\u09A7\u09BE\u09B0\u09BE\u09A8\u09C0 (\u09AC\u0999\u09CD\u0995\u09BF\u09AE\u099A\u09A8\u09CD\u09A6\u09CD\u09B0 \u099A\u099F\u09CD\u099F\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC) \u0993 \u09A8\u09BF\u09B0\u09C1\u09A6\u09CD\u09A6\u09C7\u09B6 (\u09AA\u09CD\u09B0\u09C7\u09AE\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0 \u09AE\u09BF\u09A4\u09CD\u09B0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 5: \u0930\u093E\u0927\u093E\u0930\u093E\u0928\u0940 (\u092C\u0902\u0915\u093F\u092E\u091A\u0902\u0926\u094D\u0930 \u091A\u091F\u094D\u091F\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F) \u0914\u0930 \u0928\u093F\u0930\u0941\u0926\u094D\u0926\u0947\u0936 (\u092A\u094D\u0930\u0947\u092E\u0947\u0902\u0926\u094D\u0930 \u092E\u093F\u0924\u094D\u0930)", ["\u09B6\u09CD\u09B0\u09C0\u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09C7\u09B0 \u09B0\u09A5\u09C7\u09B0 \u09AE\u09C7\u09B2\u09BE\u09AF\u09BC \u09B0\u09BE\u09A7\u09BE\u09B0\u09BE\u09A8\u09C0\u09B0 \u09AC\u09A8\u09AB\u09C1\u09B2\u09C7\u09B0 \u09AE\u09BE\u09B2\u09BE \u0993 \u09B0\u09C1\u0995\u09CD\u09AE\u09BF\u09A3\u09C0\u0995\u09C1\u09AE\u09BE\u09B0 \u09B0\u09BE\u09AF\u09BC\u09C7\u09B0 \u09B8\u09B9\u09BE\u09AF\u09BC\u09A4\u09BE", "\u09B8\u09CB\u09AE\u09C7\u09B6 \u0993 \u0995\u09A5\u0995\u09C7\u09B0 \u09B0\u09B9\u09B8\u09CD\u09AF\u09AE\u09AF\u09BC \u0997\u09B2\u09CD\u09AA"], TB_BN_9),
        ch("bn9_c6", 6, "Sahitya Sanchayan 6: \u0986\u09AC\u09B9\u09AE\u09BE\u09A8 (Nirendranath Chakravarti) & \u0986\u09AE\u09B0\u09BE (Satyendranath Dutta)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09EC: \u0986\u09AC\u09B9\u09AE\u09BE\u09A8 (\u09A8\u09C0\u09B0\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u099A\u0995\u09CD\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0) \u0993 \u0986\u09AE\u09B0\u09BE (\u09B8\u09A4\u09CD\u09AF\u09C7\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u09A6\u09A4\u09CD\u09A4)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 6: \u0906\u092C\u0939\u092E\u093E\u0928 (\u0928\u0940\u0930\u0947\u0902\u0926\u094D\u0930\u0928\u093E\u0925 \u091A\u0915\u094D\u0930\u0935\u0930\u094D\u0924\u0940) \u0914\u0930 \u0906\u092E\u0930\u093E (\u0938\u0924\u094D\u092F\u0947\u0902\u0926\u094D\u0930\u0928\u093E\u0925 \u0926\u0924\u094D\u0924)", ['"\u09AF\u09BE \u0997\u09BF\u09AF\u09BC\u09C7 \u0993\u0987 \u0989\u09A0\u09BE\u09A8\u09C7 \u09A4\u09CB\u09B0 \u09A6\u09BE\u0981\u09A1\u09BC\u09BE, \u09B2\u09BE\u0989\u09AE\u09BE\u099A\u09BE\u099F\u09BE\u09B0 \u09AA\u09BE\u09B6\u09C7" \u2014 \u09B6\u09BF\u0995\u09A1\u09BC\u09C7\u09B0 \u099A\u09BF\u09B0\u09A8\u09CD\u09A4\u09A8 \u099F\u09BE\u09A8', "\u09AC\u09BE\u0999\u09BE\u09B2\u09BF\u09B0 \u0997\u09CC\u09B0\u09AC, \u0985\u09A4\u09C0\u09B6 \u09A6\u09C0\u09AA\u0999\u09CD\u0995\u09B0, \u09AC\u09BF\u099C\u09AF\u09BC\u09B8\u09BF\u0982\u09B9, \u099A\u09BE\u0981\u09A6 \u09B8\u09A6\u09BE\u0997\u09B0 \u0993 \u099A\u09C8\u09A4\u09A8\u09CD\u09AF\u09A6\u09C7\u09AC"], TB_BN_9),
        ch("bn9_c7", 7, "Sahitya Sanchayan 7: \u0996\u09C7\u09AF\u09BC\u09BE (Rabindranath Tagore) & \u09AD\u09BE\u0999\u09BE\u09B0 \u0997\u09BE\u09A8 (Kazi Nazrul Islam)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09ED: \u0996\u09C7\u09AF\u09BC\u09BE (\u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u09A0\u09BE\u0995\u09C1\u09B0) \u0993 \u09AD\u09BE\u0999\u09BE\u09B0 \u0997\u09BE\u09A8 (\u0995\u09BE\u099C\u09C0 \u09A8\u099C\u09B0\u09C1\u09B2 \u0987\u09B8\u09B2\u09BE\u09AE)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 7: \u0916\u0947\u092F\u093E (\u0930\u0935\u0940\u0902\u0926\u094D\u0930\u0928\u093E\u0925 \u091F\u0948\u0917\u094B\u0930) \u0914\u0930 \u092D\u093E\u0919\u093E\u0930 \u0917\u093E\u0928 (\u0915\u093E\u091C\u093C\u0940 \u0928\u091C\u093C\u0930\u0941\u0932 \u0907\u0938\u094D\u0932\u093E\u092E)", ["\u09A8\u09A6\u09C0\u09B0 \u09A6\u09C1\u0987 \u09A4\u09C0\u09B0\u09C7 \u09A8\u09BE\u09AE-\u09A8\u09BE-\u099C\u09BE\u09A8\u09BE \u09A6\u09C1\u099F\u09BF \u0997\u09CD\u09B0\u09BE\u09AE\u09C7\u09B0 \u09A8\u09BF\u09A4\u09CD\u09AF \u09AA\u09BE\u09B0\u09BE\u09AA\u09BE\u09B0", '"\u0995\u09BE\u09B0\u09BE\u09B0 \u0990 \u09B2\u09CC\u09B9\u0995\u09AA\u09BE\u099F \u09AD\u09C7\u0999\u09C7 \u09AB\u09C7\u09B2 \u0995\u09B0 \u09B0\u09C7 \u09B2\u09CB\u09AA\u09BE\u099F" \u2014 \u09AA\u09B0\u09BE\u09A7\u09C0\u09A8\u09A4\u09BE\u09B0 \u09B6\u09C3\u0999\u09CD\u0996\u09B2\u09AE\u09C1\u0995\u09CD\u09A4\u09BF\u09B0 \u0986\u09B9\u09CD\u09AC\u09BE\u09A8'], TB_BN_9),
        ch("bn9_c8", 8, "Sahitya Sanchayan 8: \u099A\u09BF\u09A0\u09BF (Swami Vivekananda) & \u099A\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 (Tarashankar Bandyopadhyay)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09EE: \u099A\u09BF\u09A0\u09BF (\u09B8\u09CD\u09AC\u09BE\u09AE\u09C0 \u09AC\u09BF\u09AC\u09C7\u0995\u09BE\u09A8\u09A8\u09CD\u09A6) \u0993 \u099A\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 (\u09A4\u09BE\u09B0\u09BE\u09B6\u0999\u09CD\u0995\u09B0 \u09AC\u09A8\u09CD\u09A6\u09CD\u09AF\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 8: \u091A\u093F\u0920\u093F (\u0938\u094D\u0935\u093E\u092E\u0940 \u0935\u093F\u0935\u0947\u0915\u093E\u0928\u0902\u0926) \u0914\u0930 \u091A\u0902\u0926\u094D\u0930\u0928\u093E\u0925 (\u0924\u093E\u0930\u093E\u0936\u0902\u0915\u0930 \u092C\u0902\u0926\u094D\u092F\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F)", ["\u0986\u09B2\u09AE\u09CB\u09A1\u09BC\u09BE \u09A5\u09C7\u0995\u09C7 \u09AE\u09BF\u09B8 \u09A8\u09CB\u09AC\u09B2\u0995\u09C7 \u09B2\u09C7\u0996\u09BE \u09B8\u09CD\u09AC\u09BE\u09AE\u09C0 \u09AC\u09BF\u09AC\u09C7\u0995\u09BE\u09A8\u09A8\u09CD\u09A6\u09C7\u09B0 \u0990\u09A4\u09BF\u09B9\u09BE\u09B8\u09BF\u0995 \u09AA\u09A4\u09CD\u09B0", "\u099A\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u0993 \u09B9\u09C0\u09B0\u09C1\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09AF\u09CB\u0997\u09BF\u09A4\u09BE \u098F\u09AC\u0982 \u0995\u09BE\u09B2\u09AA\u09C1\u09B0\u09C1\u09B7 \u09A8\u0995\u09CD\u09B7\u09A4\u09CD\u09B0\u09C7\u09B0 \u09AE\u09A4\u09CB \u099A\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5\u09C7\u09B0 \u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF\u09A4\u09CD\u09AC"], TB_BN_9),
        ch("bn9_c9", 9, "Supplementary Reader: \u09AA\u09CD\u09B0\u09AB\u09C7\u09B8\u09B0 \u09B6\u0999\u09CD\u0995\u09C1\u09B0 \u09A1\u09BE\u09AF\u09BC\u09C7\u09B0\u09BF \u2014 \u09AC\u09CB\u09AE\u09AF\u09BE\u09A4\u09CD\u09B0\u09C0\u09B0 \u09A1\u09BE\u09AF\u09BC\u09C7\u09B0\u09BF, \u0995\u09B0\u09CD\u09AD\u09BE\u09B8 \u0993 \u09B8\u09CD\u09AC\u09B0\u09CD\u09A3\u09AA\u09B0\u09CD\u09A3\u09C0 (Satyajit Ray)", "\u09B8\u09B9\u09BE\u09AF\u09BC\u0995 \u09AA\u09BE\u09A0: \u09AA\u09CD\u09B0\u09AB\u09C7\u09B8\u09B0 \u09B6\u0999\u09CD\u0995\u09C1\u09B0 \u09A1\u09BE\u09AF\u09BC\u09C7\u09B0\u09BF \u2014 \u09AC\u09CB\u09AE\u09AF\u09BE\u09A4\u09CD\u09B0\u09C0\u09B0 \u09A1\u09BE\u09AF\u09BC\u09C7\u09B0\u09BF, \u0995\u09B0\u09CD\u09AD\u09BE\u09B8 \u0993 \u09B8\u09CD\u09AC\u09B0\u09CD\u09A3\u09AA\u09B0\u09CD\u09A3\u09C0 (\u09B8\u09A4\u09CD\u09AF\u099C\u09BF\u09CE \u09B0\u09BE\u09AF\u09BC)", "\u0938\u0939\u093E\u092F\u0915 \u092A\u093E\u0920: \u092A\u094D\u0930\u094B\u092B\u093C\u0947\u0938\u0930 \u0936\u0902\u0915\u0941 \u0915\u0940 \u0921\u093E\u092F\u0930\u0940 \u2014 \u092C\u094B\u092E\u092F\u093E\u0924\u094D\u0930\u0940\u0930 \u0921\u093E\u092F\u0930\u0940, \u0915\u0949\u0930\u094D\u0935\u0938 \u0914\u0930 \u0938\u094D\u0935\u0930\u094D\u0923\u092A\u0930\u094D\u0923\u0940 (\u0938\u0924\u094D\u092F\u091C\u0940\u0924 \u0930\u093E\u092F)", ["\u09AE\u0999\u09CD\u0997\u09B2\u0997\u09CD\u09B0\u09B9\u09C7 \u09AC\u09BF\u09A7\u09C1\u09B6\u09C7\u0996\u09B0, \u09AA\u09CD\u09B0\u09B9\u09CD\u09B2\u09BE\u09A6 \u0993 \u09A8\u09BF\u0989\u099F\u09A8; \u0985\u09B0\u09CD\u09A8\u09BF\u09A5\u09A8 \u09AF\u09A8\u09CD\u09A4\u09CD\u09B0 \u0993 \u0995\u09BE\u0995 \u0995\u09B0\u09CD\u09AD\u09BE\u09B8 (\u0986\u09B0\u09CD\u0997\u09BE\u09B8); \u09AE\u09BF\u09B0\u09BE\u0995\u09BF\u0989\u09B0\u09B2 \u09AC\u09A1\u09BC\u09BF \u0993 \u09B8\u09CD\u09AC\u09B0\u09CD\u09A3\u09AA\u09B0\u09CD\u09A3\u09C0"], TB_BN_9),
        ch("bn9_c10", 10, "Bhasha Path 1: \u09A7\u09CD\u09AC\u09A8\u09BF \u0993 \u09A7\u09CD\u09AC\u09A8\u09BF \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 (\u09B8\u09CD\u09AC\u09B0\u09A7\u09CD\u09AC\u09A8\u09BF, \u09AC\u09CD\u09AF\u099E\u09CD\u099C\u09A8\u09A7\u09CD\u09AC\u09A8\u09BF \u0993 \u09A7\u09CD\u09AC\u09A8\u09BF \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8\u09C7\u09B0 \u09B0\u09C0\u09A4\u09BF)", "\u09AD\u09BE\u09B7\u09BE\u09AA\u09BE\u09A0 \u09E7: \u09A7\u09CD\u09AC\u09A8\u09BF \u0993 \u09A7\u09CD\u09AC\u09A8\u09BF \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8", "\u092D\u093E\u0937\u093E\u092A\u093E\u0920 1: \u0927\u094D\u0935\u0928\u093F \u0914\u0930 \u0927\u094D\u0935\u0928\u093F \u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928", ["\u09AE\u09CC\u09B2\u09BF\u0995 \u09B8\u09CD\u09AC\u09B0\u09A7\u09CD\u09AC\u09A8\u09BF (\u09ED\u099F\u09BF), \u09AF\u09CC\u0997\u09BF\u0995 \u09B8\u09CD\u09AC\u09B0\u09A7\u09CD\u09AC\u09A8\u09BF (\u09E8\u099F\u09BF), \u09AC\u09CD\u09AF\u099E\u09CD\u099C\u09A8\u09A7\u09CD\u09AC\u09A8\u09BF\u09B0 \u0989\u099A\u09CD\u099A\u09BE\u09B0\u09A3 \u09B8\u09CD\u09A5\u09BE\u09A8 \u0993 \u09AA\u09CD\u09B0\u0995\u09C3\u09A4\u09BF", "\u09B8\u09CD\u09AC\u09B0\u09AD\u0995\u09CD\u09A4\u09BF/\u09AC\u09BF\u09AA\u09CD\u09B0\u0995\u09B0\u09CD\u09B7, \u0985\u09AA\u09BF\u09A8\u09BF\u09B9\u09BF\u09A4\u09BF, \u0985\u09AD\u09BF\u09B6\u09CD\u09B0\u09C1\u09A4\u09BF, \u09B8\u09CD\u09AC\u09B0\u09B8\u0982\u0997\u09A4\u09BF, \u09B8\u09AE\u09C0\u09AD\u09AC\u09A8, \u09A8\u09BE\u09B8\u09BF\u0995\u09CD\u09AF\u09C0\u09AD\u09AC\u09A8"], TB_BN_9),
        ch("bn9_c11", 11, "Bhasha Path 2: \u09B6\u09AC\u09CD\u09A6\u0997\u09A0\u09A8 \u2014 \u0989\u09AA\u09B8\u09B0\u09CD\u0997, \u09A7\u09BE\u09A4\u09C1 \u0993 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09AF\u09BC (\u0995\u09C3\u09CE \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09AF\u09BC \u0993 \u09A4\u09A6\u09CD\u09A7\u09BF\u09A4 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09AF\u09BC)", "\u09AD\u09BE\u09B7\u09BE\u09AA\u09BE\u09A0 \u09E8: \u09B6\u09AC\u09CD\u09A6\u0997\u09A0\u09A8 \u2014 \u0989\u09AA\u09B8\u09B0\u09CD\u0997, \u09A7\u09BE\u09A4\u09C1 \u0993 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09AF\u09BC (\u0995\u09C3\u09CE \u0993 \u09A4\u09A6\u09CD\u09A7\u09BF\u09A4)", "\u092D\u093E\u0937\u093E\u092A\u093E\u0920 2: \u0936\u092C\u094D\u0926 \u0930\u091A\u0928\u093E \u2014 \u0909\u092A\u0938\u0930\u094D\u0917, \u0927\u093E\u0924\u0941 \u0914\u0930 \u092A\u094D\u0930\u0924\u094D\u092F\u092F (\u0915\u0943\u0924\u094D \u090F\u0935\u0902 \u0924\u0926\u094D\u0927\u093F\u0924)", ["\u09B8\u0982\u09B8\u09CD\u0995\u09C3\u09A4, \u09AC\u09BE\u0982\u09B2\u09BE \u0993 \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF \u0989\u09AA\u09B8\u09B0\u09CD\u0997; \u09AE\u09CC\u09B2\u09BF\u0995, \u09B8\u09BE\u09A7\u09BF\u09A4 \u0993 \u09B8\u0982\u09AF\u09CB\u0997\u09AE\u09C2\u09B2\u0995 \u09A7\u09BE\u09A4\u09C1; \u0995\u09C3\u09CE \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09AF\u09BC \u0993 \u09A4\u09A6\u09CD\u09A7\u09BF\u09A4 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09AF\u09BC \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC"], TB_BN_9),
        ch("bn9_c12", 12, "Bhasha Path 3: \u09AA\u09A6 \u09AA\u09CD\u09B0\u0995\u09B0\u09A3 (\u09AC\u09BF\u09B6\u09C7\u09B7\u09CD\u09AF, \u09B8\u09B0\u09CD\u09AC\u09A8\u09BE\u09AE, \u09AC\u09BF\u09B6\u09C7\u09B7\u09A3, \u0985\u09AC\u09CD\u09AF\u09AF\u09BC, \u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE) \u0993 \u09A8\u09BF\u09B0\u09CD\u09AE\u09BF\u09A4\u09BF (\u09AD\u09BE\u09AC\u09B8\u09AE\u09CD\u09AA\u09CD\u09B0\u09B8\u09BE\u09B0\u09A3, \u09B8\u09BE\u09B0\u09BE\u0982\u09B6, \u0997\u09B2\u09CD\u09AA \u0993 \u09AA\u09CD\u09B0\u09AC\u09A8\u09CD\u09A7)", "\u09AD\u09BE\u09B7\u09BE\u09AA\u09BE\u09A0 \u09E9: \u09AA\u09A6 \u09AA\u09CD\u09B0\u0995\u09B0\u09A3 \u0993 \u09A8\u09BF\u09B0\u09CD\u09AE\u09BF\u09A4\u09BF (\u09AD\u09BE\u09AC\u09B8\u09AE\u09CD\u09AA\u09CD\u09B0\u09B8\u09BE\u09B0\u09A3, \u09B8\u09BE\u09B0\u09BE\u0982\u09B6 \u0993 \u09AA\u09CD\u09B0\u09AC\u09A8\u09CD\u09A7 \u09B0\u099A\u09A8\u09BE)", "\u092D\u093E\u0937\u093E\u092A\u093E\u0920 3: \u092A\u0926 \u092A\u094D\u0930\u0915\u0930\u0923 \u0914\u0930 \u0928\u093F\u0930\u094D\u092E\u093F\u0924\u093F (\u092D\u093E\u0935-\u092A\u0932\u094D\u0932\u0935\u0928, \u0938\u093E\u0930\u093E\u0902\u0936 \u0914\u0930 \u0928\u093F\u092C\u0902\u0927 \u0932\u0947\u0916\u0928)", ["\u09AC\u09BF\u09B6\u09C7\u09B7\u09CD\u09AF, \u09B8\u09B0\u09CD\u09AC\u09A8\u09BE\u09AE, \u09AC\u09BF\u09B6\u09C7\u09B7\u09A3, \u0985\u09AC\u09CD\u09AF\u09AF\u09BC \u0993 \u0985\u09B8\u09AE\u09BE\u09AA\u09BF\u0995\u09BE/\u09B8\u09AE\u09BE\u09AA\u09BF\u0995\u09BE \u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE\u09B0 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u09B6\u09CD\u09B0\u09C7\u09A3\u09C0\u09AC\u09BF\u09AD\u09BE\u0997"], TB_BN_9)
      ]
    },
    10: {
      status: "prescribed",
      verificationStatus: "verified",
      applicableToClass: true,
      textbookName: TB_BN_10,
      syllabusVersion: "WBBSE Madhyamik Pariksha Syllabus (Current Edition)",
      officialSource: "WBBSE \u2014 Sahitya Sanchayan, Bhasha Path & Koni Class X",
      boardNote: {
        en: "Official WBBSE Class X Sahitya Sanchayan, Bhasha Path & Koni (Madhyamik Pariksha) \u2014 All 12 Verified Units.",
        bn: "\u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AE\u09A7\u09CD\u09AF\u09B6\u09BF\u0995\u09CD\u09B7\u09BE \u09AA\u09B0\u09CD\u09B7\u09A6 (WBBSE) \u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8, \u09AD\u09BE\u09B7\u09BE\u09AA\u09BE\u09A0 \u0993 \u0995\u09CB\u09A8\u09BF (\u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995) \u2014 \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09E7\u09E8\u099F\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC\u0964",
        hi: "WBBSE \u0915\u0915\u094D\u0937\u093E 10 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928, \u092D\u093E\u0937\u093E\u092A\u093E\u0920 \u0914\u0930 \u0915\u094B\u0928\u093F (\u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E) \u2014 \u0938\u092D\u0940 12 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092F\u0964"
      },
      chapters: [
        ch("bn10_c1", 1, "Sahitya Sanchayan 1: \u099C\u09CD\u099E\u09BE\u09A8\u099A\u0995\u09CD\u09B7\u09C1 (Ashapurna Devi) & \u0985\u09B8\u09C1\u0996\u09C0 \u098F\u0995\u099C\u09A8 (Pablo Neruda / Nabarun Bhattacharya)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09E7: \u099C\u09CD\u099E\u09BE\u09A8\u099A\u0995\u09CD\u09B7\u09C1 (\u0986\u09B6\u09BE\u09AA\u09C2\u09B0\u09CD\u09A3\u09BE \u09A6\u09C7\u09AC\u09C0) \u0993 \u0985\u09B8\u09C1\u0996\u09C0 \u098F\u0995\u099C\u09A8 (\u09AA\u09BE\u09AC\u09B2\u09CB \u09A8\u09C7\u09B0\u09C1\u09A6\u09BE / \u09A8\u09AC\u09BE\u09B0\u09C1\u09A3 \u09AD\u099F\u09CD\u099F\u09BE\u099A\u09BE\u09B0\u09CD\u09AF)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 1: \u091C\u094D\u091E\u093E\u0928\u091A\u0915\u094D\u0937\u0941 (\u0906\u0936\u093E\u092A\u0942\u0930\u094D\u0923\u093E \u0926\u0947\u0935\u0940) \u0914\u0930 \u0905\u0938\u0941\u0916\u0940 \u090F\u0915\u091C\u0928 (\u092A\u093E\u092C\u094D\u0932\u094B \u0928\u0947\u0930\u0941\u0926\u093E / \u0928\u0935\u093E\u0930\u0941\u0923 \u092D\u091F\u094D\u091F\u093E\u091A\u093E\u0930\u094D\u092F)", ["\u09A4\u09AA\u09A8\u09C7\u09B0 \u099B\u09CB\u099F\u09AE\u09C7\u09B8\u09CB\u09B0 \u09B2\u09C7\u0996\u0995 \u09B8\u09A4\u09CD\u09A4\u09BE, \u09B8\u09A8\u09CD\u09A7\u09CD\u09AF\u09BE\u09A4\u09BE\u09B0\u09BE \u09AA\u09A4\u09CD\u09B0\u09BF\u0995\u09BE\u09AF\u09BC \u09AA\u09CD\u09B0\u09A5\u09AE \u0997\u09B2\u09CD\u09AA \u0993 \u09A4\u09AA\u09A8\u09C7\u09B0 \u09A8\u09BF\u099C\u09B8\u09CD\u09AC \u09B8\u0982\u0995\u09B2\u09CD\u09AA", "\u09AF\u09C1\u09A6\u09CD\u09A7\u09C7\u09B0 \u09A7\u09CD\u09AC\u0982\u09B8\u09B2\u09C0\u09B2\u09BE\u09B0 \u09AE\u09BE\u099D\u09C7\u0993 \u09A6\u09B0\u099C\u09BE\u09AF\u09BC \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09AE\u09BE\u09A3 \u09AE\u09C7\u09AF\u09BC\u09C7\u09B0 \u0985\u09AE\u09B0 \u09AD\u09BE\u09B2\u09CB\u09AC\u09BE\u09B8\u09BE \u0993 \u09AE\u09BE\u09A4\u09C3\u09AD\u09C2\u09AE\u09BF"], TB_BN_10),
        ch("bn10_c2", 2, "Sahitya Sanchayan 2: \u0986\u09AF\u09BC \u0986\u09B0\u09CB \u09AC\u09C7\u0981\u09A7\u09C7 \u09AC\u09C7\u0981\u09A7\u09C7 \u09A5\u09BE\u0995\u09BF (Shankha Ghosh) & \u0986\u09AB\u09CD\u09B0\u09BF\u0995\u09BE (Rabindranath Tagore)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09E8: \u0986\u09AF\u09BC \u0986\u09B0\u09CB \u09AC\u09C7\u0981\u09A7\u09C7 \u09AC\u09C7\u0981\u09A7\u09C7 \u09A5\u09BE\u0995\u09BF (\u09B6\u0999\u09CD\u0996 \u0998\u09CB\u09B7) \u0993 \u0986\u09AB\u09CD\u09B0\u09BF\u0995\u09BE (\u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u09A0\u09BE\u0995\u09C1\u09B0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 2: \u0906\u092F \u0906\u0930\u094B \u092C\u0901\u0927\u0947 \u092C\u0901\u0927\u0947 \u0925\u093E\u0915\u093F (\u0936\u0902\u0916 \u0918\u094B\u0937) \u0914\u0930 \u0905\u092B\u093C\u094D\u0930\u0940\u0915\u093E (\u0930\u0935\u0940\u0902\u0926\u094D\u0930\u0928\u093E\u0925 \u091F\u0948\u0917\u094B\u0930)", ["\u09AF\u09C1\u09A6\u09CD\u09A7 \u0993 \u09AC\u09BF\u09AA\u09A8\u09CD\u09A8\u09A4\u09BE\u09B0 \u09AE\u09C1\u0996\u09C7 \u09AE\u09BE\u09A8\u09AC\u09BF\u0995 \u0990\u0995\u09CD\u09AF \u0993 \u09B8\u0982\u09B9\u09A4\u09BF\u09B0 \u0986\u09B9\u09CD\u09AC\u09BE\u09A8", '\u09B8\u09BE\u09AE\u09CD\u09B0\u09BE\u099C\u09CD\u09AF\u09AC\u09BE\u09A6\u09C0 \u09AC\u09B0\u09CD\u09AC\u09B0\u09A4\u09BE\u09B0 \u09AC\u09BF\u09B0\u09C1\u09A6\u09CD\u09A7\u09C7 \u0995\u09AC\u09BF\u09B0 \u09A7\u09BF\u0995\u09CD\u0995\u09BE\u09B0: "\u098F\u09B8\u09CB \u09AF\u09C1\u0997\u09BE\u09A8\u09CD\u09A4\u09B0\u09C7\u09B0 \u0995\u09AC\u09BF, \u0986\u09B8\u09A8\u09CD\u09A8 \u09B8\u09A8\u09CD\u09A7\u09CD\u09AF\u09BE\u09B0 \u09B6\u09C7\u09B7 \u09B0\u09B6\u09CD\u09AE\u09BF\u09AA\u09BE\u09A4\u09C7 \u2014 \u09A6\u09BE\u0981\u09A1\u09BC\u09BE\u0993 \u0993\u0987 \u09AE\u09BE\u09A8\u09B9\u09BE\u09B0\u09BE \u09AE\u09BE\u09A8\u09AC\u09C0\u09B0 \u09A6\u09CD\u09AC\u09BE\u09B0\u09C7"'], TB_BN_10),
        ch("bn10_c3", 3, "Sahitya Sanchayan 3: \u09B9\u09BE\u09B0\u09BF\u09AF\u09BC\u09C7 \u09AF\u09BE\u0993\u09AF\u09BC\u09BE \u0995\u09BE\u09B2\u09BF \u0995\u09B2\u09AE (Sripantha / Nikhil Sarkar) & \u09AC\u09B9\u09C1\u09B0\u09C2\u09AA\u09C0 (Subodh Ghosh)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09E9: \u09B9\u09BE\u09B0\u09BF\u09AF\u09BC\u09C7 \u09AF\u09BE\u0993\u09AF\u09BC\u09BE \u0995\u09BE\u09B2\u09BF \u0995\u09B2\u09AE (\u09B6\u09CD\u09B0\u09C0\u09AA\u09BE\u09A8\u09CD\u09A5) \u0993 \u09AC\u09B9\u09C1\u09B0\u09C2\u09AA\u09C0 (\u09B8\u09C1\u09AC\u09CB\u09A7 \u0998\u09CB\u09B7)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 3: \u0939\u093E\u0930\u093F\u092F\u0947 \u091C\u093E\u0935\u093E \u0915\u093E\u0932\u093F \u0915\u0932\u092E (\u0936\u094D\u0930\u0940\u092A\u093E\u0902\u0925) \u0914\u0930 \u092C\u0939\u0941\u0930\u0942\u092A\u0940 (\u0938\u0941\u092C\u094B\u0927 \u0918\u094B\u0937)", ["\u0996\u09BE\u0997\u09A1\u09BC\u09BE\u09B0 \u0995\u09B2\u09AE, \u09AA\u09BE\u09B2\u0995\u09C7\u09B0 \u0995\u09C1\u0987\u09B2, \u09AB\u09BE\u0989\u09A8\u09CD\u099F\u09C7\u09A8 \u09AA\u09C7\u09A8 (\u0993\u09AF\u09BC\u09BE\u099F\u09BE\u09B0\u09AE\u09CD\u09AF\u09BE\u09A8) \u0993 \u09A6\u09CB\u09AF\u09BC\u09BE\u09A4\u09C7\u09B0 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8", "\u09B9\u09B0\u09BF\u09A6\u09BE \u09AC\u09B9\u09C1\u09B0\u09C2\u09AA\u09C0\u09B0 \u09AC\u09BF\u09B0\u09BE\u0997\u09C0 \u09AC\u09C7\u09B6 \u0993 \u099C\u0997\u09A6\u09C0\u09B6\u09AC\u09BE\u09AC\u09C1\u09B0 \u098F\u0995\u09B6\u09CB \u098F\u0995 \u099F\u09BE\u0995\u09BE\u09B0 \u09A5\u09B2\u09BF \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8 \u0995\u09B0\u09C7 \u0996\u09BE\u0981\u099F\u09BF \u09B6\u09BF\u09B2\u09CD\u09AA\u09B8\u09A4\u09CD\u09A4\u09BE\u09B0 \u099C\u09AF\u09BC"], TB_BN_10),
        ch("bn10_c4", 4, "Sahitya Sanchayan 4: \u0985\u09AD\u09BF\u09B7\u09C7\u0995 (Michael Madhusudan Dutt) & \u09AA\u09CD\u09B0\u09B2\u09AF\u09BC\u09CB\u09B2\u09CD\u09B2\u09BE\u09B8 (Kazi Nazrul Islam)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09EA: \u0985\u09AD\u09BF\u09B7\u09C7\u0995 (\u09AE\u09BE\u0987\u0995\u09C7\u09B2 \u09AE\u09A7\u09C1\u09B8\u09C2\u09A6\u09A8 \u09A6\u09A4\u09CD\u09A4) \u0993 \u09AA\u09CD\u09B0\u09B2\u09AF\u09BC\u09CB\u09B2\u09CD\u09B2\u09BE\u09B8 (\u0995\u09BE\u099C\u09C0 \u09A8\u099C\u09B0\u09C1\u09B2 \u0987\u09B8\u09B2\u09BE\u09AE)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 4: \u0905\u092D\u093F\u0937\u0947\u0915 (\u092E\u093E\u0907\u0915\u0932 \u092E\u0927\u0941\u0938\u0942\u0926\u0928 \u0926\u0924\u094D\u0924) \u0914\u0930 \u092A\u094D\u0930\u0932\u092F\u094B\u0932\u094D\u0932\u093E\u0938 (\u0915\u093E\u091C\u093C\u0940 \u0928\u091C\u093C\u0930\u0941\u0932 \u0907\u0938\u094D\u0932\u093E\u092E)", ["\u09AE\u09C7\u0998\u09A8\u09BE\u09A6\u09AC\u09A7 \u0995\u09BE\u09AC\u09CD\u09AF\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A5\u09AE \u09B8\u09B0\u09CD\u0997: \u09AC\u09C0\u09B0\u09AC\u09BE\u09B9\u09C1\u09B0 \u09AE\u09C3\u09A4\u09CD\u09AF\u09C1\u09B8\u0982\u09AC\u09BE\u09A6, \u09AA\u09CD\u09B0\u09AE\u09C0\u09B2\u09BE \u0993 \u09B0\u09BE\u09AC\u09A3\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u0987\u09A8\u09CD\u09A6\u09CD\u09B0\u099C\u09BF\u09A4\u09C7\u09B0 \u09B8\u0982\u09B2\u09BE\u09AA \u0993 \u09B8\u09C7\u09A8\u09BE\u09AA\u09A4\u09BF \u09AA\u09A6\u09C7 \u0985\u09AD\u09BF\u09B7\u09C7\u0995", '"\u09A4\u09CB\u09B0\u09BE \u09B8\u09AC \u099C\u09AF\u09BC\u09A7\u09CD\u09AC\u09A8\u09BF \u0995\u09B0!" \u2014 \u0995\u09BE\u09B2\u09AD\u09C8\u09B0\u09AC\u09C7\u09B0 \u09AA\u09CD\u09B0\u09B2\u09AF\u09BC-\u09A8\u09C3\u09A4\u09CD\u09AF \u0993 \u09A8\u09A4\u09C1\u09A8\u09C7\u09B0 \u0995\u09C7\u09A4\u09A8'], TB_BN_10),
        ch("bn10_c5", 5, "Sahitya Sanchayan 5: \u09B8\u09BF\u09B0\u09BE\u099C\u09A6\u09CD\u09A6\u09CC\u09B2\u09BE (Sachindranath Sengupta) & \u09AA\u09A5\u09C7\u09B0 \u09A6\u09BE\u09AC\u09C0 (Sarat Chandra Chattopadhyay)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09EB: \u09B8\u09BF\u09B0\u09BE\u099C\u09A6\u09CD\u09A6\u09CC\u09B2\u09BE (\u09B6\u099A\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u09B8\u09C7\u09A8\u0997\u09C1\u09AA\u09CD\u09A4) \u0993 \u09AA\u09A5\u09C7\u09B0 \u09A6\u09BE\u09AC\u09C0 (\u09B6\u09B0\u09CE\u099A\u09A8\u09CD\u09A6\u09CD\u09B0 \u099A\u099F\u09CD\u099F\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 5: \u0938\u093F\u0930\u093E\u091C\u0941\u0926\u094D\u0926\u094C\u0932\u093E (\u0936\u091A\u0940\u0902\u0926\u094D\u0930\u0928\u093E\u0925 \u0938\u0947\u0928\u0917\u0941\u092A\u094D\u0924) \u0914\u0930 \u092A\u0925\u0947\u0930 \u0926\u093E\u092C\u0940 (\u0936\u0930\u0924\u094D\u091A\u0902\u0926\u094D\u0930 \u091A\u091F\u094D\u091F\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F)", ["\u09A8\u09AC\u09BE\u09AC \u09B8\u09BF\u09B0\u09BE\u099C\u09A6\u09CD\u09A6\u09CC\u09B2\u09BE, \u09AE\u09C0\u09B0\u099C\u09BE\u09AB\u09B0, \u09B0\u09BE\u099C\u09AC\u09B2\u09CD\u09B2\u09AD, \u09AE\u09CB\u09B9\u09A8\u09B2\u09BE\u09B2, \u09AE\u09C0\u09B0\u09AE\u09A6\u09A8 \u0993 \u09B2\u09C1\u09CE\u09AB\u09C1\u09A8\u09CD\u09A8\u09BF\u09B8\u09BE \u2014 \u09AC\u09BE\u0982\u09B2\u09BE\u09B0 \u09B8\u09CD\u09AC\u09BE\u09A7\u09C0\u09A8\u09A4\u09BE\u09B0 \u09B6\u09C7\u09B7 \u09AA\u09CD\u09B0\u09A6\u09C0\u09AA", "\u09B8\u09AC\u09CD\u09AF\u09B8\u09BE\u099A\u09C0 \u09AE\u09B2\u09CD\u09B2\u09BF\u0995 (\u0997\u09BF\u09B0\u09C0\u09B6 \u09AE\u09B9\u09BE\u09AA\u09BE\u09A4\u09CD\u09B0\u09C7\u09B0 \u099B\u09A6\u09CD\u09AE\u09AC\u09C7\u09B6), \u0985\u09AA\u09C2\u09B0\u09CD\u09AC, \u09A8\u09BF\u09AE\u09BE\u0987\u09AC\u09BE\u09AC\u09C1 \u0993 \u099C\u0997\u09A6\u09C0\u09B6\u09AC\u09BE\u09AC\u09C1\u09B0 \u09B0\u09C7\u0999\u09CD\u0997\u09C1\u09A8 \u09AA\u09C1\u09B2\u09BF\u09B8 \u09B8\u09CD\u099F\u09C7\u09B6\u09A8\u09C7\u09B0 \u09A6\u09C3\u09B6\u09CD\u09AF"], TB_BN_10),
        ch("bn10_c6", 6, "Sahitya Sanchayan 6: \u09B8\u09BF\u09A8\u09CD\u09A7\u09C1\u09A4\u09C0\u09B0\u09C7 (Syed Alaol) & \u0985\u09B8\u09CD\u09A4\u09CD\u09B0\u09C7\u09B0 \u09AC\u09BF\u09B0\u09C1\u09A6\u09CD\u09A7\u09C7 \u0997\u09BE\u09A8 (Joy Goswami)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09EC: \u09B8\u09BF\u09A8\u09CD\u09A7\u09C1\u09A4\u09C0\u09B0\u09C7 (\u09B8\u09C8\u09AF\u09BC\u09A6 \u0986\u09B2\u09BE\u0993\u09B2) \u0993 \u0985\u09B8\u09CD\u09A4\u09CD\u09B0\u09C7\u09B0 \u09AC\u09BF\u09B0\u09C1\u09A6\u09CD\u09A7\u09C7 \u0997\u09BE\u09A8 (\u099C\u09AF\u09BC \u0997\u09CB\u09B8\u09CD\u09AC\u09BE\u09AE\u09C0)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 6: \u0938\u093F\u0902\u0927\u0941\u0924\u0940\u0930\u0947 (\u0938\u0948\u092F\u0926 \u0906\u0932\u093E\u0913\u0932) \u0914\u0930 \u0905\u0938\u094D\u0924\u094D\u0930\u0947\u0930 \u0935\u093F\u0930\u0941\u0926\u094D\u0927\u0947 \u0917\u093E\u0928 (\u091C\u092F \u0917\u094B\u0938\u094D\u0935\u093E\u092E\u0940)", ["\u09AA\u09A6\u09CD\u09AE\u09BE\u09AC\u09A4\u09C0 \u0995\u09BE\u09AC\u09CD\u09AF\u09C7\u09B0 \u09B8\u09AE\u09C1\u09A6\u09CD\u09B0\u0995\u09A8\u09CD\u09AF\u09BE \u09AA\u09A6\u09CD\u09AE\u09BE \u0995\u09B0\u09CD\u09A4\u09C3\u0995 \u0985\u099A\u09C8\u09A4\u09A8\u09CD\u09AF \u09AA\u09A6\u09CD\u09AE\u09BE\u09AC\u09A4\u09C0\u09B0 \u09B8\u09C7\u09AC\u09BE \u0993 \u099C\u09C0\u09AC\u09A8\u09A6\u09BE\u09A8", '"\u0985\u09B8\u09CD\u09A4\u09CD\u09B0 \u09AB\u09C7\u09B2\u09CB, \u0985\u09B8\u09CD\u09A4\u09CD\u09B0 \u09B0\u09BE\u0996\u09CB \u09AA\u09BE\u09AF\u09BC\u09C7" \u2014 \u09AF\u09C1\u09A6\u09CD\u09A7 \u0993 \u09B9\u09BF\u0982\u09B8\u09BE\u09B0 \u09AC\u09BF\u09B0\u09C1\u09A6\u09CD\u09A7\u09C7 \u0997\u09BE\u09A8\u09C7\u09B0 \u09AC\u09B0\u09CD\u09AE'], TB_BN_10),
        ch("bn10_c7", 7, "Sahitya Sanchayan 7: \u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE\u09AF\u09BC \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 (Rajsekhar Basu / Parashuram) & \u09A8\u09A6\u09C0\u09B0 \u09AC\u09BF\u09A6\u09CD\u09B0\u09CB\u09B9 (Manik Bandyopadhyay)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09ED: \u09AC\u09BE\u0982\u09B2\u09BE \u09AD\u09BE\u09B7\u09BE\u09AF\u09BC \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 (\u09B0\u09BE\u099C\u09B6\u09C7\u0996\u09B0 \u09AC\u09B8\u09C1) \u0993 \u09A8\u09A6\u09C0\u09B0 \u09AC\u09BF\u09A6\u09CD\u09B0\u09CB\u09B9 (\u09AE\u09BE\u09A8\u09BF\u0995 \u09AC\u09A8\u09CD\u09A6\u09CD\u09AF\u09CB\u09AA\u09BE\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 7: \u092C\u093E\u0902\u0917\u094D\u0932\u093E \u092D\u093E\u0937\u093E\u092F \u0935\u093F\u091C\u094D\u091E\u093E\u0928 (\u0930\u093E\u091C\u0936\u0947\u0916\u0930 \u092C\u0938\u0941) \u0914\u0930 \u0928\u0926\u0940\u0930 \u0935\u093F\u0926\u094D\u0930\u094B\u0939 (\u092E\u093E\u0923\u093F\u0915 \u092C\u0902\u0926\u094D\u092F\u094B\u092A\u093E\u0927\u094D\u092F\u093E\u092F)", ["\u09AA\u09B0\u09BF\u09AD\u09BE\u09B7\u09BE \u09B0\u099A\u09A8\u09BE (\u09AC\u0999\u09CD\u0997\u09C0\u09AF\u09BC \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AA\u09B0\u09BF\u09B7\u09A6 \u0993 \u0995\u09B2\u09BF\u0995\u09BE\u09A4\u09BE \u09AC\u09BF\u09B6\u09CD\u09AC\u09AC\u09BF\u09A6\u09CD\u09AF\u09BE\u09B2\u09AF\u09BC), \u09AA\u09BE\u09B0\u09BF\u09AD\u09BE\u09B7\u09BF\u0995 \u09B6\u09AC\u09CD\u09A6 \u0993 \u0985\u09B2\u0982\u0995\u09BE\u09B0\u09AC\u09B0\u09CD\u099C\u09BF\u09A4 \u09B8\u09B9\u099C \u09AC\u09C8\u099C\u09CD\u099E\u09BE\u09A8\u09BF\u0995 \u09B0\u099A\u09A8\u09BE\u09B6\u09C8\u09B2\u09C0", "\u09A8\u09A6\u09C7\u09B0\u099A\u09BE\u0981\u09A6\u09C7\u09B0 \u09A8\u09A6\u09C0\u09AA\u09CD\u09B0\u09C7\u09AE, \u09AA\u09BE\u0981\u099A \u09A6\u09BF\u09A8 \u0985\u09AC\u09BF\u09B0\u09BE\u09AE \u09AC\u09C3\u09B7\u09CD\u099F\u09BF, \u09AC\u09BE\u0981\u09A7\u09C7\u09B0 \u09AC\u09A8\u09CD\u09A6\u09BF\u09A6\u09B6\u09BE \u09A5\u09C7\u0995\u09C7 \u09A8\u09A6\u09C0\u09B0 \u09AE\u09C1\u0995\u09CD\u09A4\u09BF \u0993 \u09ED \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A1\u09BE\u0989\u09A8 \u09AA\u09CD\u09AF\u09BE\u09B8\u09C7\u099E\u09CD\u099C\u09BE\u09B0 \u099F\u09CD\u09B0\u09C7\u09A8"], TB_BN_10),
        ch("bn10_c8", 8, "Sahitya Sanchayan 8: \u0985\u09A6\u09B2 \u09AC\u09A6\u09B2 (Pannalal Patel / \u0985\u09B0\u09CD\u0998\u09CD\u09AF\u0995\u09C1\u09B8\u09C1\u09AE \u09A6\u09A4\u09CD\u09A4\u0997\u09C1\u09AA\u09CD\u09A4)", "\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09B8\u099E\u09CD\u099A\u09AF\u09BC\u09A8 \u09EE: \u0985\u09A6\u09B2 \u09AC\u09A6\u09B2 (\u09AA\u09BE\u09A8\u09CD\u09A8\u09BE\u09B2\u09BE\u09B2 \u09AA\u09CD\u09AF\u09BE\u099F\u09C7\u09B2)", "\u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0938\u0902\u091A\u092F\u0928 8: \u0905\u0926\u0932 \u092C\u0926\u0932 (\u092A\u0928\u094D\u0928\u093E\u0932\u093E\u0932 \u092A\u091F\u0947\u0932)", ["\u0985\u09AE\u09C3\u09A4 \u0993 \u0987\u09B8\u09BE\u09AC\u09C7\u09B0 \u0985\u0995\u09C3\u09A4\u09CD\u09B0\u09BF\u09AE \u09AC\u09A8\u09CD\u09A7\u09C1\u09A4\u09CD\u09AC, \u099C\u09BE\u09AE\u09BE \u0985\u09A6\u09B2-\u09AC\u09A6\u09B2 \u098F\u09AC\u0982 \u09B9\u09BE\u09B8\u09BE\u09A8 \u0993 \u09AC\u09BE\u09AC\u09C1\u09B0 \u09B8\u09BE\u09AE\u09CD\u09AA\u09CD\u09B0\u09A6\u09BE\u09AF\u09BC\u09BF\u0995 \u09B8\u09AE\u09CD\u09AA\u09CD\u09B0\u09C0\u09A4\u09BF\u09B0 \u0989\u09A6\u09AF\u09BE\u09AA\u09A8"], TB_BN_10),
        ch("bn10_c9", 9, "Supplementary Reader: \u0995\u09CB\u09A8\u09BF (Moti Nandi \u2014 Complete Novel)", "\u09B8\u09B9\u09BE\u09AF\u09BC\u0995 \u09AA\u09BE\u09A0: \u0995\u09CB\u09A8\u09BF (\u09AE\u09A4\u09BF \u09A8\u09A8\u09CD\u09A6\u09C0)", "\u0938\u0939\u093E\u092F\u0915 \u092A\u093E\u0920: \u0915\u094B\u0928\u093F (\u092E\u0924\u093F \u0928\u0902\u0926\u0940)", ['\u0995\u09CD\u09B7\u09BF\u09A4\u09C0\u09B6 \u09B8\u09BF\u0982\u09B9 (\u0995\u09CD\u09B7\u09BF\u09A6\u09CD\u09A6\u09BE), \u0995\u09A8\u0995\u099A\u09BE\u0981\u09AA\u09BE \u09AA\u09BE\u09B2 (\u0995\u09CB\u09A8\u09BF), \u09AC\u09BE\u09B0\u09C1\u09A3\u09C0\u09B0 \u0997\u0999\u09CD\u0997\u09BE\u09B8\u09CD\u09A8\u09BE\u09A8, \u099C\u09C1\u09AA\u09BF\u099F\u09BE\u09B0 \u0995\u09CD\u09B2\u09BE\u09AC \u09A5\u09C7\u0995\u09C7 \u0985\u09CD\u09AF\u09BE\u09AA\u09CB\u09B2\u09CB \u0995\u09CD\u09B2\u09BE\u09AC, \u09AA\u09CD\u09B0\u099C\u09BE\u09AA\u09A4\u09BF \u09A1\u09CD\u09B0\u09C7\u09B8\u09B6\u09AA (\u09B2\u09C0\u09B2\u09BE\u09AC\u09A4\u09C0), \u09B9\u09BF\u09AF\u09BC\u09BE \u09AE\u09BF\u09A4\u09CD\u09B0 \u0993 \u09AE\u09BE\u09A6\u09CD\u09B0\u09BE\u099C \u099C\u09BE\u09A4\u09C0\u09AF\u09BC \u09B8\u09BE\u0981\u09A4\u09BE\u09B0 \u099A\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09BF\u09AF\u09BC\u09A8\u09B6\u09BF\u09AA\u09C7 "\u09AB\u09BE\u0987\u099F \u0995\u09CB\u09A8\u09BF \u09AB\u09BE\u0987\u099F"'], TB_BN_10),
        ch("bn10_c10", 10, "Bhasha Path 1: \u0995\u09BE\u09B0\u0995 \u0993 \u0985\u0995\u09BE\u09B0\u0995 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995 (\u0995\u09B0\u09CD\u09A4\u09C3, \u0995\u09B0\u09CD\u09AE, \u0995\u09B0\u09A3, \u09A8\u09BF\u09AE\u09BF\u09A4\u09CD\u09A4, \u0985\u09AA\u09BE\u09A6\u09BE\u09A8, \u0985\u09A7\u09BF\u0995\u09B0\u09A3 \u098F\u09AC\u0982 \u09B8\u09AE\u09CD\u09AC\u09A8\u09CD\u09A7 \u0993 \u09B8\u09AE\u09CD\u09AC\u09CB\u09A7\u09A8 \u09AA\u09A6)", "\u09AD\u09BE\u09B7\u09BE\u09AA\u09BE\u09A0 \u09E7: \u0995\u09BE\u09B0\u0995 \u0993 \u0985\u0995\u09BE\u09B0\u0995 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995", "\u092D\u093E\u0937\u093E\u092A\u093E\u0920 1: \u0915\u093E\u0930\u0915 \u0914\u0930 \u0905\u0915\u093E\u0930\u0915 \u0938\u0902\u092C\u0902\u0927", ["\u099B\u09AF\u09BC \u09AA\u09CD\u09B0\u0995\u09BE\u09B0 \u0995\u09BE\u09B0\u0995, \u09B8\u09AE\u09A7\u09BE\u09A4\u09C1\u099C \u0995\u09B0\u09CD\u09A4\u09BE/\u0995\u09B0\u09CD\u09AE/\u0995\u09B0\u09A3, \u09A8\u09BF\u09B0\u09AA\u09C7\u0995\u09CD\u09B7 \u0995\u09B0\u09CD\u09A4\u09BE, \u09AC\u09CD\u09AF\u09A4\u09BF\u09B9\u09BE\u09B0 \u0995\u09B0\u09CD\u09A4\u09BE, \u0995\u09BE\u09B2\u09BE\u09A7\u09BF\u0995\u09B0\u09A3, \u09B8\u09CD\u09A5\u09BE\u09A8\u09BE\u09A7\u09BF\u0995\u09B0\u09A3, \u09AC\u09BF\u09B7\u09AF\u09BC\u09BE\u09A7\u09BF\u0995\u09B0\u09A3 \u098F\u09AC\u0982 \u09B8\u09AE\u09CD\u09AC\u09A8\u09CD\u09A7 \u0993 \u09B8\u09AE\u09CD\u09AC\u09CB\u09A7\u09A8 \u09AA\u09A6"], TB_BN_10),
        ch("bn10_c11", 11, "Bhasha Path 2: \u09B8\u09AE\u09BE\u09B8 (\u09A6\u09CD\u09AC\u09A8\u09CD\u09A6\u09CD\u09AC, \u0995\u09B0\u09CD\u09AE\u09A7\u09BE\u09B0\u09AF\u09BC, \u09A4\u09CE\u09AA\u09C1\u09B0\u09C1\u09B7, \u09AC\u09B9\u09C1\u09AC\u09CD\u09B0\u09C0\u09B9\u09BF, \u09A6\u09CD\u09AC\u09BF\u0997\u09C1, \u0985\u09AC\u09CD\u09AF\u09AF\u09BC\u09C0\u09AD\u09BE\u09AC, \u09A8\u09BF\u09A4\u09CD\u09AF \u0993 \u09AC\u09BE\u0995\u09CD\u09AF\u09BE\u09B6\u09CD\u09B0\u09AF\u09BC\u09C0 \u09B8\u09AE\u09BE\u09B8)", "\u09AD\u09BE\u09B7\u09BE\u09AA\u09BE\u09A0 \u09E8: \u09B8\u09AE\u09BE\u09B8 \u09AA\u09CD\u09B0\u0995\u09B0\u09A3", "\u092D\u093E\u0937\u093E\u092A\u093E\u0920 2: \u0938\u092E\u093E\u0938 \u092A\u094D\u0930\u0915\u0930\u0923", ["\u09AC\u09CD\u09AF\u09BE\u09B8\u09AC\u09BE\u0995\u09CD\u09AF \u09B8\u09B9 \u09B8\u09AE\u09BE\u09B8 \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC: \u0989\u09AA\u09AE\u09BE\u09A8, \u0989\u09AA\u09AE\u09BF\u09A4 \u0993 \u09B0\u09C2\u09AA\u0995 \u0995\u09B0\u09CD\u09AE\u09A7\u09BE\u09B0\u09AF\u09BC; \u09AC\u09CD\u09AF\u09A7\u09BF\u0995\u09B0\u09A3 \u0993 \u09B8\u09AE\u09BE\u09A8\u09BE\u09A7\u09BF\u0995\u09B0\u09A3 \u09AC\u09B9\u09C1\u09AC\u09CD\u09B0\u09C0\u09B9\u09BF; \u09AE\u09A7\u09CD\u09AF\u09AA\u09A6\u09B2\u09CB\u09AA\u09C0 \u0995\u09B0\u09CD\u09AE\u09A7\u09BE\u09B0\u09AF\u09BC \u0993 \u09A8\u09BF\u09A4\u09CD\u09AF \u09B8\u09AE\u09BE\u09B8"], TB_BN_10),
        ch("bn10_c12", 12, "Bhasha Path 3: \u09AC\u09BE\u0995\u09CD\u09AF \u0993 \u09AC\u09BE\u099A\u09CD\u09AF \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u098F\u09AC\u0982 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995 \u09A8\u09BF\u09B0\u09CD\u09AE\u09BF\u09A4\u09BF (\u09B8\u0982\u09B2\u09BE\u09AA \u09B0\u099A\u09A8\u09BE, \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8 \u09B0\u099A\u09A8\u09BE, \u09AC\u0999\u09CD\u0997\u09BE\u09A8\u09C1\u09AC\u09BE\u09A6 \u0993 \u09AA\u09CD\u09B0\u09AC\u09A8\u09CD\u09A7 \u09B0\u099A\u09A8\u09BE)", "\u09AD\u09BE\u09B7\u09BE\u09AA\u09BE\u09A0 \u09E9: \u09AC\u09BE\u0995\u09CD\u09AF \u0993 \u09AC\u09BE\u099A\u09CD\u09AF \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u098F\u09AC\u0982 \u09A8\u09BF\u09B0\u09CD\u09AE\u09BF\u09A4\u09BF (\u09B8\u0982\u09B2\u09BE\u09AA, \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8, \u09AC\u0999\u09CD\u0997\u09BE\u09A8\u09C1\u09AC\u09BE\u09A6 \u0993 \u09AA\u09CD\u09B0\u09AC\u09A8\u09CD\u09A7)", "\u092D\u093E\u0937\u093E\u092A\u093E\u0920 3: \u0935\u093E\u0915\u094D\u092F \u0914\u0930 \u0935\u093E\u091A\u094D\u092F \u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928 \u0924\u0925\u093E \u0928\u093F\u0930\u094D\u092E\u093F\u0924\u093F (\u0938\u0902\u0935\u093E\u0926, \u092A\u094D\u0930\u0924\u093F\u0935\u0947\u0926\u0928, \u0905\u0928\u0941\u0935\u093E\u0926 \u0914\u0930 \u0928\u093F\u092C\u0902\u0927)", ["\u09B8\u09B0\u09B2, \u099C\u099F\u09BF\u09B2, \u09AF\u09CC\u0997\u09BF\u0995 \u09AC\u09BE\u0995\u09CD\u09AF \u09B0\u09C2\u09AA\u09BE\u09A8\u09CD\u09A4\u09B0; \u0995\u09B0\u09CD\u09A4\u09C3\u09AC\u09BE\u099A\u09CD\u09AF, \u0995\u09B0\u09CD\u09AE\u09AC\u09BE\u099A\u09CD\u09AF, \u09AD\u09BE\u09AC\u09AC\u09BE\u099A\u09CD\u09AF \u0993 \u0995\u09B0\u09CD\u09AE\u0995\u09B0\u09CD\u09A4\u09C3\u09AC\u09BE\u099A\u09CD\u09AF \u09B0\u09C2\u09AA\u09BE\u09A8\u09CD\u09A4\u09B0; \u0987\u0982\u09B0\u09C7\u099C\u09BF \u09A5\u09C7\u0995\u09C7 \u09AC\u0999\u09CD\u0997\u09BE\u09A8\u09C1\u09AC\u09BE\u09A6, \u09B8\u0982\u09B2\u09BE\u09AA \u0993 \u09B8\u0982\u09AC\u09BE\u09A6\u09AA\u09A4\u09CD\u09B0\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8"], TB_BN_10)
      ]
    }
  }
};
var HINDI_SUBJECT = {
  id: "hindi_subject",
  name: {
    en: "Hindi (Language Track)",
    bn: "\u09B9\u09BF\u09A8\u09CD\u09A6\u09BF (Hindi Language Track)",
    hi: "\u0939\u093F\u0928\u094D\u0926\u0940 (Hindi Language Track)"
  },
  shortDesc: {
    en: "Hindi grammar (Vyakaran), prose, poetry, and composition. Marked pending verification where medium-specific WBBSE textbook editions vary.",
    bn: "\u09B9\u09BF\u09A8\u09CD\u09A6\u09BF \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3, \u0997\u09A6\u09CD\u09AF, \u0995\u09AC\u09BF\u09A4\u09BE \u0993 \u09B0\u099A\u09A8\u09BE\u0964 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09AD\u09BF\u09A4\u09CD\u09A4\u09BF\u0995 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995 \u09B8\u0982\u09B8\u09CD\u0995\u09B0\u09A3 \u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09B8\u09CD\u09AC\u099A\u09CD\u099B\u09AD\u09BE\u09AC\u09C7 \u099A\u09BF\u09B9\u09CD\u09A8\u09BF\u09A4\u0964",
    hi: "\u0939\u093F\u0928\u094D\u0926\u0940 \u0935\u094D\u092F\u093E\u0915\u0930\u0923, \u0917\u0926\u094D\u092F, \u092A\u0926\u094D\u092F \u0914\u0930 \u0930\u091A\u0928\u093E\u0964 \u092E\u093E\u0927\u094D\u092F\u092E-\u0906\u0927\u093E\u0930\u093F\u0924 WBBSE \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u0938\u0902\u0938\u094D\u0915\u0930\u0923 \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0939\u0947\u0924\u0941 \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u0940 \u0930\u0942\u092A \u0938\u0947 \u091A\u093F\u0939\u094D\u0928\u093F\u0924\u0964"
  },
  domainGuardKeywords: [
    "\u0939\u093F\u0928\u094D\u0926\u0940",
    "\u0935\u094D\u092F\u093E\u0915\u0930\u0923",
    "\u0938\u0902\u091C\u094D\u091E\u093E",
    "\u0938\u0930\u094D\u0935\u0928\u093E\u092E",
    "\u0935\u093F\u0936\u0947\u0937\u0923",
    "\u0915\u094D\u0930\u093F\u092F\u093E",
    "\u0938\u0902\u0927\u093F",
    "\u0938\u092E\u093E\u0938",
    "\u092E\u0941\u0939\u093E\u0935\u0930\u0947",
    "\u0926\u094B\u0939\u0947",
    "\u0915\u092C\u0940\u0930",
    "\u0924\u0941\u0932\u0938\u0940\u0926\u093E\u0938",
    "\u092A\u094D\u0930\u0947\u092E\u091A\u0902\u0926",
    "\u0909\u092A\u0938\u0930\u094D\u0917",
    "\u092A\u094D\u0930\u0924\u094D\u092F\u092F"
  ],
  curriculumByClass: {
    5: {
      status: "language_elective",
      verificationStatus: "pending_verification",
      applicableToClass: true,
      textbookName: TB_HI_PENDING,
      syllabusVersion: "WBBPE Hindi Medium / Language Track (Pending Official Textbook Edition Verification)",
      officialSource: "Pending verification of official WBBPE Hindi medium chapter list",
      boardNote: {
        en: "Pending Verification: Core Hindi Grammar & Literature units provided; official WBBPE Hindi-medium chapter sequence is pending verification.",
        bn: "\u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC: \u09AE\u09C2\u09B2 \u09B9\u09BF\u09A8\u09CD\u09A6\u09BF \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3 \u0993 \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u098F\u0995\u0995 \u0989\u09AA\u09B2\u09AC\u09CD\u09A7; \u09B8\u09B0\u0995\u09BE\u09B0\u09BF WBBPE \u09B9\u09BF\u09A8\u09CD\u09A6\u09BF \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC\u0964",
        hi: "\u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0932\u0902\u092C\u093F\u0924: \u092E\u0941\u0916\u094D\u092F \u0939\u093F\u0928\u094D\u0926\u0940 \u0935\u094D\u092F\u093E\u0915\u0930\u0923 \u090F\u0935\u0902 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0907\u0915\u093E\u0907\u092F\u093E\u0901 \u0909\u092A\u0932\u092C\u094D\u0927; \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 WBBPE \u0905\u0927\u094D\u092F\u093E\u092F \u0938\u0942\u091A\u0940 \u0915\u093E \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0932\u0902\u092C\u093F\u0924 \u0939\u0948\u0964"
      },
      chapters: [
        ch("hi5_c1", 1, "Unit 1: Varna-Vichar, Matra, Sangya, Sarvanam & Ling-Vachan", "\u09AA\u09BE\u09A0 \u09E7: \u09AC\u09B0\u09CD\u09A3\u09AC\u09BF\u099A\u09BE\u09B0, \u09AE\u09BE\u09A4\u09CD\u09B0\u09BE, \u09B8\u0982\u099C\u09CD\u099E\u09BE, \u09B8\u09B0\u09CD\u09AC\u09A8\u09BE\u09AE \u0993 \u09B2\u09BF\u0999\u09CD\u0997-\u09AC\u099A\u09A8", "\u0907\u0915\u093E\u0908 1: \u0935\u0930\u094D\u0923-\u0935\u093F\u091A\u093E\u0930, \u092E\u093E\u0924\u094D\u0930\u093E, \u0938\u0902\u091C\u094D\u091E\u093E, \u0938\u0930\u094D\u0935\u0928\u093E\u092E \u0924\u0925\u093E \u0932\u093F\u0902\u0917-\u0935\u091A\u0928", ["\u0938\u094D\u0935\u0930 \u0914\u0930 \u0935\u094D\u092F\u0902\u091C\u0928 \u0935\u0930\u094D\u0923", "\u0938\u0902\u091C\u094D\u091E\u093E \u0914\u0930 \u0938\u0930\u094D\u0935\u0928\u093E\u092E \u0915\u0947 \u092D\u0947\u0926", "\u0932\u093F\u0902\u0917 \u0914\u0930 \u0935\u091A\u0928 \u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928"], TB_HI_PENDING, "pending_verification"),
        ch("hi5_c2", 2, "Unit 2: Vilom Shabda, Paryayvachi Shabda & Moral Stories", "\u09AA\u09BE\u09A0 \u09E8: \u09AC\u09BF\u09AA\u09B0\u09C0\u09A4 \u09B6\u09AC\u09CD\u09A6, \u09B8\u09AE\u09BE\u09B0\u09CD\u09A5\u0995 \u09B6\u09AC\u09CD\u09A6 \u0993 \u09A8\u09C0\u09A4\u09BF\u09AE\u09C2\u09B2\u0995 \u0997\u09B2\u09CD\u09AA", "\u0907\u0915\u093E\u0908 2: \u0935\u093F\u0932\u094B\u092E \u0936\u092C\u094D\u0926, \u092A\u0930\u094D\u092F\u093E\u092F\u0935\u093E\u091A\u0940 \u0936\u092C\u094D\u0926 \u0914\u0930 \u0928\u0948\u0924\u093F\u0915 \u0915\u0939\u093E\u0928\u093F\u092F\u093E\u0901", ["\u092A\u0930\u094D\u092F\u093E\u092F\u0935\u093E\u091A\u0940 \u0914\u0930 \u0935\u093F\u0932\u094B\u092E \u0936\u092C\u094D\u0926", "\u0938\u0930\u0932 \u0905\u092A\u0920\u093F\u0924 \u0917\u0926\u094D\u092F\u093E\u0902\u0936 \u0914\u0930 \u092C\u094B\u0927"], TB_HI_PENDING, "pending_verification")
      ]
    },
    6: {
      status: "language_elective",
      verificationStatus: "pending_verification",
      applicableToClass: true,
      textbookName: TB_HI_PENDING,
      syllabusVersion: "WBBSE Upper Primary Third/First Language Track (Pending Official Verification)",
      officialSource: "Pending verification of school-specific WBBSE Hindi textbook edition",
      boardNote: {
        en: "Pending Verification: Core Hindi Vyakaran & Sahitya units provided; official school-specific WBBSE Hindi textbook edition is pending verification.",
        bn: "\u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC: \u09AE\u09C2\u09B2 \u09B9\u09BF\u09A8\u09CD\u09A6\u09BF \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3 \u0993 \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u098F\u0995\u0995 \u0989\u09AA\u09B2\u09AC\u09CD\u09A7; \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995 \u09B8\u0982\u09B8\u09CD\u0995\u09B0\u09A3 \u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC\u0964",
        hi: "\u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0932\u0902\u092C\u093F\u0924: \u092E\u0941\u0916\u094D\u092F \u0939\u093F\u0928\u094D\u0926\u0940 \u0935\u094D\u092F\u093E\u0915\u0930\u0923 \u090F\u0935\u0902 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0907\u0915\u093E\u0907\u092F\u093E\u0901 \u0909\u092A\u0932\u092C\u094D\u0927; \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u0938\u0902\u0938\u094D\u0915\u0930\u0923 \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0932\u0902\u092C\u093F\u0924 \u0939\u0948\u0964"
      },
      chapters: [
        ch("hi6_c1", 1, "Unit 1: Visheshan, Kriya, Kaal & Karak (Case Markers)", "\u09AA\u09BE\u09A0 \u09E7: \u09AC\u09BF\u09B6\u09C7\u09B7\u09A3, \u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09BE, \u0995\u09BE\u09B2 \u0993 \u0995\u09BE\u09B0\u0995", "\u0907\u0915\u093E\u0908 1: \u0935\u093F\u0936\u0947\u0937\u0923, \u0915\u094D\u0930\u093F\u092F\u093E, \u0915\u093E\u0932 \u0914\u0930 \u0915\u093E\u0930\u0915-\u091A\u093F\u0939\u094D\u0928", ["\u0935\u093F\u0936\u0947\u0937\u0923 \u0915\u0947 \u091A\u093E\u0930 \u092D\u0947\u0926", "\u0905\u0915\u0930\u094D\u092E\u0915 \u0914\u0930 \u0938\u0915\u0930\u094D\u092E\u0915 \u0915\u094D\u0930\u093F\u092F\u093E", "\u092D\u0942\u0924, \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0914\u0930 \u092D\u0935\u093F\u0937\u094D\u092F\u0924\u094D \u0915\u093E\u0932, \u0906\u0920 \u0915\u093E\u0930\u0915"], TB_HI_PENDING, "pending_verification"),
        ch("hi6_c2", 2, "Unit 2: Muhavare, Anek Shabdon ke Liye Ek Shabda & Doha/Prose", "\u09AA\u09BE\u09A0 \u09E8: \u09AC\u09BE\u0997\u09A7\u09BE\u09B0\u09BE, \u098F\u0995\u0995\u09A5\u09BE\u09AF\u09BC \u09AA\u09CD\u09B0\u0995\u09BE\u09B6 \u0993 \u09A6\u09CB\u09B9\u09BE/\u0997\u09A6\u09CD\u09AF", "\u0907\u0915\u093E\u0908 2: \u092E\u0941\u0939\u093E\u0935\u0930\u0947, \u0905\u0928\u0947\u0915 \u0936\u092C\u094D\u0926\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u0936\u092C\u094D\u0926 \u0914\u0930 \u0928\u0940\u0924\u093F \u0926\u094B\u0939\u0947", ["\u092A\u094D\u0930\u091A\u0932\u093F\u0924 \u092E\u0941\u0939\u093E\u0935\u0930\u0947 \u0914\u0930 \u0935\u093E\u0915\u094D\u092F\u093E\u0902\u0936", "\u0915\u092C\u0940\u0930 \u0914\u0930 \u0930\u0939\u0940\u092E \u0915\u0947 \u0928\u0940\u0924\u093F \u0926\u094B\u0939\u0947"], TB_HI_PENDING, "pending_verification")
      ]
    },
    7: {
      status: "language_elective",
      verificationStatus: "pending_verification",
      applicableToClass: true,
      textbookName: TB_HI_PENDING,
      syllabusVersion: "WBBSE Upper Primary Third/First Language Track (Pending Official Verification)",
      officialSource: "Pending verification of school-specific WBBSE Hindi textbook edition",
      boardNote: {
        en: "Pending Verification: Core Hindi Vyakaran & Sahitya units provided; official WBBSE third/first language textbook chapter index is pending verification.",
        bn: "\u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC: \u09AE\u09C2\u09B2 \u09B9\u09BF\u09A8\u09CD\u09A6\u09BF \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3 \u0993 \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u098F\u0995\u0995 \u0989\u09AA\u09B2\u09AC\u09CD\u09A7; \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09B8\u09C2\u099A\u09BF \u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC\u0964",
        hi: "\u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0932\u0902\u092C\u093F\u0924: \u092E\u0941\u0916\u094D\u092F \u0939\u093F\u0928\u094D\u0926\u0940 \u0935\u094D\u092F\u093E\u0915\u0930\u0923 \u090F\u0935\u0902 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0907\u0915\u093E\u0907\u092F\u093E\u0901 \u0909\u092A\u0932\u092C\u094D\u0927; \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0905\u0927\u094D\u092F\u093E\u092F \u0938\u0942\u091A\u0940 \u0915\u093E \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0932\u0902\u092C\u093F\u0924 \u0939\u0948\u0964"
      },
      chapters: [
        ch("hi7_c1", 1, "Unit 1: Sandhi (Swar Sandhi), Upsarg, Pratyay & Shabda-Bhandar", "\u09AA\u09BE\u09A0 \u09E7: \u09B8\u09CD\u09AC\u09B0\u09B8\u09A8\u09CD\u09A7\u09BF, \u0989\u09AA\u09B8\u09B0\u09CD\u0997, \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09AF\u09BC \u0993 \u09B6\u09AC\u09CD\u09A6\u09AD\u09BE\u09A3\u09CD\u09A1\u09BE\u09B0", "\u0907\u0915\u093E\u0908 1: \u0938\u0902\u0927\u093F (\u0938\u094D\u0935\u0930 \u0938\u0902\u0927\u093F), \u0909\u092A\u0938\u0930\u094D\u0917, \u092A\u094D\u0930\u0924\u094D\u092F\u092F \u0914\u0930 \u0936\u092C\u094D\u0926-\u092D\u0902\u0921\u093E\u0930", ["\u0926\u0940\u0930\u094D\u0918, \u0917\u0941\u0923, \u0935\u0943\u0926\u094D\u0927\u093F, \u092F\u0923 \u0914\u0930 \u0905\u092F\u093E\u0926\u093F \u0938\u094D\u0935\u0930 \u0938\u0902\u0927\u093F", "\u0924\u0924\u094D\u0938\u092E, \u0924\u0926\u094D\u092D\u0935, \u0926\u0947\u0936\u091C \u0914\u0930 \u0906\u0917\u0924 \u0936\u092C\u094D\u0926"], TB_HI_PENDING, "pending_verification"),
        ch("hi7_c2", 2, "Unit 2: Hindi Prose, Bhakti & Niti Poetry and Patra-Lekhan", "\u09AA\u09BE\u09A0 \u0968: \u09B9\u09BF\u09A8\u09CD\u09A6\u09BF \u0997\u09A6\u09CD\u09AF, \u09AD\u0995\u09CD\u09A4\u09BF \u0993 \u09A8\u09C0\u09A4\u09BF \u0995\u09AC\u09BF\u09A4\u09BE \u098F\u09AC\u0982 \u09AA\u09A4\u09CD\u09B0\u09B0\u099A\u09A8\u09BE", "\u0907\u0915\u093E\u0908 2: \u0939\u093F\u0928\u094D\u0926\u0940 \u0917\u0926\u094D\u092F, \u092D\u0915\u094D\u0924\u093F \u090F\u0935\u0902 \u0928\u0940\u0924\u093F \u0915\u093E\u0935\u094D\u092F \u0914\u0930 \u092A\u0924\u094D\u0930-\u0932\u0947\u0916\u0928", ["\u092A\u094D\u0930\u0947\u092E\u091A\u0902\u0926 \u0915\u0940 \u0915\u0939\u093E\u0928\u093F\u092F\u093E\u0901", "\u0914\u092A\u091A\u093E\u0930\u093F\u0915 \u0914\u0930 \u0905\u0928\u094C\u092A\u091A\u093E\u0930\u093F\u0915 \u092A\u0924\u094D\u0930 \u0932\u0947\u0916\u0928"], TB_HI_PENDING, "pending_verification")
      ]
    },
    8: {
      status: "language_elective",
      verificationStatus: "pending_verification",
      applicableToClass: true,
      textbookName: TB_HI_PENDING,
      syllabusVersion: "WBBSE Upper Primary Third/First Language Track (Pending Official Verification)",
      officialSource: "Pending verification of school-specific WBBSE Hindi textbook edition",
      boardNote: {
        en: "Pending Verification: Core Hindi Vyakaran & Sahitya units provided; official WBBSE third/first language textbook chapter index is pending verification.",
        bn: "\u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC: \u09AE\u09C2\u09B2 \u09B9\u09BF\u09A8\u09CD\u09A6\u09BF \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3 \u0993 \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u098F\u0995\u0995 \u0989\u09AA\u09B2\u09AC\u09CD\u09A7; \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u09B8\u09C2\u099A\u09BF \u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC\u0964",
        hi: "\u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0932\u0902\u092C\u093F\u0924: \u092E\u0941\u0916\u094D\u092F \u0939\u093F\u0928\u094D\u0926\u0940 \u0935\u094D\u092F\u093E\u0915\u0930\u0923 \u090F\u0935\u0902 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0907\u0915\u093E\u0907\u092F\u093E\u0901 \u0909\u092A\u0932\u092C\u094D\u0927; \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0905\u0927\u094D\u092F\u093E\u092F \u0938\u0942\u091A\u0940 \u0915\u093E \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0932\u0902\u092C\u093F\u0924 \u0939\u0948\u0964"
      },
      chapters: [
        ch("hi8_c1", 1, "Unit 1: Samas (Compound Words), Vyanjan/Visarga Sandhi & Vakya-Bhed", "\u09AA\u09BE\u09A0 \u09E7: \u09B8\u09AE\u09BE\u09B8, \u09AC\u09CD\u09AF\u099E\u09CD\u099C\u09A8/\u09AC\u09BF\u09B8\u09B0\u09CD\u0997 \u09B8\u09A8\u09CD\u09A7\u09BF \u0993 \u09AC\u09BE\u0995\u09CD\u09AF\u09AD\u09C7\u09A6", "\u0907\u0915\u093E\u0908 1: \u0938\u092E\u093E\u0938, \u0935\u094D\u092F\u0902\u091C\u0928/\u0935\u093F\u0938\u0930\u094D\u0917 \u0938\u0902\u0927\u093F \u0914\u0930 \u0935\u093E\u0915\u094D\u092F-\u092D\u0947\u0926", ["\u0905\u0935\u094D\u092F\u092F\u0940\u092D\u093E\u0935, \u0924\u0924\u094D\u092A\u0941\u0930\u0941\u0937, \u0915\u0930\u094D\u092E\u0927\u093E\u0930\u092F, \u0926\u094D\u0935\u093F\u0917\u0941, \u0926\u094D\u0935\u0902\u0926\u094D\u0935 \u0914\u0930 \u092C\u0939\u0941\u0935\u094D\u0930\u0940\u0939\u093F \u0938\u092E\u093E\u0938", "\u0938\u0930\u0932, \u0938\u0902\u092F\u0941\u0915\u094D\u0924 \u0914\u0930 \u092E\u093F\u0936\u094D\u0930 \u0935\u093E\u0915\u094D\u092F"], TB_HI_PENDING, "pending_verification"),
        ch("hi8_c2", 2, "Unit 2: Modern Hindi Prose, Poetry & Nibandh-Lekhan", "\u09AA\u09BE\u09A0 \u09E8: \u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u09B9\u09BF\u09A8\u09CD\u09A6\u09BF \u0997\u09A6\u09CD\u09AF, \u0995\u09AC\u09BF\u09A4\u09BE \u0993 \u09AA\u09CD\u09B0\u09AC\u09A8\u09CD\u09A7 \u09B0\u099A\u09A8\u09BE", "\u0907\u0915\u093E\u0908 2: \u0906\u0927\u0941\u0928\u093F\u0915 \u0939\u093F\u0928\u094D\u0926\u0940 \u0917\u0926\u094D\u092F, \u092A\u0926\u094D\u092F \u0914\u0930 \u0928\u093F\u092C\u0902\u0927-\u0932\u0947\u0916\u0928", ["\u092E\u0941\u0939\u093E\u0935\u0930\u0947 \u0914\u0930 \u0932\u094B\u0915\u094B\u0915\u094D\u0924\u093F\u092F\u093E\u0901", "\u0905\u0928\u0941\u091A\u094D\u091B\u0947\u0926 \u0914\u0930 \u0928\u093F\u092C\u0902\u0927 \u0932\u0947\u0916\u0928"], TB_HI_PENDING, "pending_verification")
      ]
    },
    9: {
      status: "language_elective",
      verificationStatus: "pending_verification",
      applicableToClass: true,
      textbookName: TB_HI_PENDING,
      syllabusVersion: "WBBSE Secondary Hindi Track (Pending Official Sahitya Sanchayan Hindi Edition Verification)",
      officialSource: "Pending verification of WBBSE Class IX Hindi medium textbook chapter index",
      boardNote: {
        en: "Pending Verification: Core Class IX Hindi Vyakaran (Alankar, Vachya, Samas) & Literature provided; full WBBSE Hindi-medium chapter sequence is pending verification.",
        bn: "\u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC: \u09A8\u09AC\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09B0 \u09B9\u09BF\u09A8\u09CD\u09A6\u09BF \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3 \u0993 \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u098F\u0995\u0995 \u0989\u09AA\u09B2\u09AC\u09CD\u09A7; \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u0995\u09CD\u09B0\u09AE \u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC\u0964",
        hi: "\u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0932\u0902\u092C\u093F\u0924: \u0915\u0915\u094D\u0937\u093E 9 \u0939\u093F\u0928\u094D\u0926\u0940 \u0935\u094D\u092F\u093E\u0915\u0930\u0923 (\u0905\u0932\u0902\u0915\u093E\u0930, \u0935\u093E\u091A\u094D\u092F, \u0938\u092E\u093E\u0938) \u090F\u0935\u0902 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0909\u092A\u0932\u092C\u094D\u0927; \u092A\u0942\u0930\u094D\u0923 \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0905\u0927\u094D\u092F\u093E\u092F \u0915\u094D\u0930\u092E \u0915\u093E \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0932\u0902\u092C\u093F\u0924 \u0939\u0948\u0964"
      },
      chapters: [
        ch("hi9_c1", 1, "Unit 1: Alankar (Anupras, Yamak, Shlesh, Upama, Rupak), Vachya & Samas", "\u09AA\u09BE\u09A0 \u09E7: \u0985\u09B2\u0982\u0995\u09BE\u09B0, \u09AC\u09BE\u099A\u09CD\u09AF \u0993 \u09B8\u09AE\u09BE\u09B8", "\u0907\u0915\u093E\u0908 1: \u0905\u0932\u0902\u0915\u093E\u0930, \u0935\u093E\u091A\u094D\u092F-\u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928 \u0914\u0930 \u0938\u092E\u093E\u0938", ["\u0936\u092C\u094D\u0926\u093E\u0932\u0902\u0915\u093E\u0930 \u0914\u0930 \u0905\u0930\u094D\u0925\u093E\u0932\u0902\u0915\u093E\u0930", "\u0915\u0930\u094D\u0924\u0943\u0935\u093E\u091A\u094D\u092F, \u0915\u0930\u094D\u092E\u0935\u093E\u091A\u094D\u092F \u0914\u0930 \u092D\u093E\u0935\u0935\u093E\u091A\u094D\u092F"], TB_HI_PENDING, "pending_verification"),
        ch("hi9_c2", 2, "Unit 2: Kabir Sakhi, Surdas Pad, Premchand Prose & Unseen Comprehension", "\u09AA\u09BE\u09A0 \u09E8: \u0995\u09AC\u09C0\u09B0\u09C7\u09B0 \u09B8\u09BE\u0996\u09C0, \u09B8\u09C1\u09B0\u09A6\u09BE\u09B8\u09C7\u09B0 \u09AA\u09A6, \u09AA\u09CD\u09B0\u09C7\u09AE\u099A\u09A8\u09CD\u09A6\u09C7\u09B0 \u0997\u09A6\u09CD\u09AF \u0993 \u09AC\u09CB\u09A7\u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09A3", "\u0907\u0915\u093E\u0908 2: \u0915\u092C\u0940\u0930 \u0915\u0940 \u0938\u093E\u0916\u0940, \u0938\u0942\u0930\u0926\u093E\u0938 \u0915\u0947 \u092A\u0926, \u092A\u094D\u0930\u0947\u092E\u091A\u0902\u0926 \u0917\u0926\u094D\u092F \u0914\u0930 \u0905\u092A\u0920\u093F\u0924 \u092C\u094B\u0927", ["\u092D\u0915\u094D\u0924\u093F\u0915\u093E\u0932 \u0914\u0930 \u0906\u0927\u0941\u0928\u093F\u0915 \u0915\u093E\u0932 \u0915\u0947 \u092A\u094D\u0930\u092E\u0941\u0916 \u0930\u091A\u0928\u093E\u0915\u093E\u0930"], TB_HI_PENDING, "pending_verification")
      ]
    },
    10: {
      status: "language_elective",
      verificationStatus: "pending_verification",
      applicableToClass: true,
      textbookName: TB_HI_PENDING,
      syllabusVersion: "WBBSE Madhyamik Hindi Track (Pending Official Sahitya Sanchayan Hindi Edition Verification)",
      officialSource: "Pending verification of WBBSE Class X Hindi medium textbook chapter index",
      boardNote: {
        en: "Pending Verification: Core Class X Madhyamik Hindi Vyakaran, Vakya/Vachya & Composition provided; full WBBSE Hindi-medium chapter sequence is pending verification.",
        bn: "\u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC: \u09A6\u09B6\u09AE \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09BF\u0995 \u09B9\u09BF\u09A8\u09CD\u09A6\u09BF \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3 \u0993 \u09B0\u099A\u09A8\u09BE \u098F\u0995\u0995 \u0989\u09AA\u09B2\u09AC\u09CD\u09A7; \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09B8\u09B0\u0995\u09BE\u09B0\u09BF \u0985\u09A7\u09CD\u09AF\u09BE\u09AF\u09BC \u0995\u09CD\u09B0\u09AE \u09AF\u09BE\u099A\u09BE\u0987\u09AF\u09BC\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC\u0964",
        hi: "\u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0932\u0902\u092C\u093F\u0924: \u0915\u0915\u094D\u0937\u093E 10 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0939\u093F\u0928\u094D\u0926\u0940 \u0935\u094D\u092F\u093E\u0915\u0930\u0923, \u0935\u093E\u0915\u094D\u092F/\u0935\u093E\u091A\u094D\u092F \u0930\u0942\u092A\u093E\u0902\u0924\u0930\u0923 \u090F\u0935\u0902 \u0930\u091A\u0928\u093E \u0909\u092A\u0932\u092C\u094D\u0927; \u092A\u0942\u0930\u094D\u0923 \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0905\u0927\u094D\u092F\u093E\u092F \u0915\u094D\u0930\u092E \u0915\u093E \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0932\u0902\u092C\u093F\u0924 \u0939\u0948\u0964"
      },
      chapters: [
        ch("hi10_c1", 1, "Unit 1: Vakya-Rupantaran, Vachya-Parivartan, Karak, Samas & Shuddha-Ashuddha Vakya", "\u09AA\u09BE\u09A0 \u09E7: \u09AC\u09BE\u0995\u09CD\u09AF \u09B0\u09C2\u09AA\u09BE\u09A8\u09CD\u09A4\u09B0, \u09AC\u09BE\u099A\u09CD\u09AF \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8, \u0995\u09BE\u09B0\u0995, \u09B8\u09AE\u09BE\u09B8 \u0993 \u09AC\u09BE\u0995\u09CD\u09AF \u09B6\u09C1\u09A6\u09CD\u09A7\u09BF\u0995\u09B0\u09A3", "\u0907\u0915\u093E\u0908 1: \u0935\u093E\u0915\u094D\u092F-\u0930\u0942\u092A\u093E\u0902\u0924\u0930\u0923, \u0935\u093E\u091A\u094D\u092F-\u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928, \u0915\u093E\u0930\u0915, \u0938\u092E\u093E\u0938 \u0914\u0930 \u0935\u093E\u0915\u094D\u092F-\u0936\u0941\u0926\u094D\u0927\u093F", ["\u0930\u091A\u0928\u093E \u0914\u0930 \u0905\u0930\u094D\u0925 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930 \u0935\u093E\u0915\u094D\u092F \u0930\u0942\u092A\u093E\u0902\u0924\u0930\u0923", "\u0915\u0930\u094D\u0924\u0943\u0935\u093E\u091A\u094D\u092F, \u0915\u0930\u094D\u092E\u0935\u093E\u091A\u094D\u092F \u0914\u0930 \u092D\u093E\u0935\u0935\u093E\u091A\u094D\u092F \u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928"], TB_HI_PENDING, "pending_verification"),
        ch("hi10_c2", 2, "Unit 2: Tulsidas, Nirala, Dinkar Poetry, Modern Hindi Prose, Patra, Prativedan & Nibandh", "\u09AA\u09BE\u09A0 \u09E8: \u09A4\u09C1\u09B2\u09B8\u09C0\u09A6\u09BE\u09B8, \u09A8\u09BF\u09B0\u09BE\u09B2\u09BE, \u09A6\u09BF\u09A8\u0995\u09B0\u09C7\u09B0 \u0995\u09AC\u09BF\u09A4\u09BE, \u0997\u09A6\u09CD\u09AF, \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09C7\u09A6\u09A8 \u0993 \u09AA\u09CD\u09B0\u09AC\u09A8\u09CD\u09A7 \u09B0\u099A\u09A8\u09BE", "\u0907\u0915\u093E\u0908 2: \u0924\u0941\u0932\u0938\u0940\u0926\u093E\u0938, \u0928\u093F\u0930\u093E\u0932\u093E, \u0926\u093F\u0928\u0915\u0930 \u0915\u093E\u0935\u094D\u092F, \u0906\u0927\u0941\u0928\u093F\u0915 \u0917\u0926\u094D\u092F, \u092A\u094D\u0930\u0924\u093F\u0935\u0947\u0926\u0928 \u0914\u0930 \u0928\u093F\u092C\u0902\u0927", ["\u0938\u092E\u094D\u092A\u093E\u0926\u0915\u0940\u092F \u092A\u0924\u094D\u0930, \u092A\u094D\u0930\u0924\u093F\u0935\u0947\u0926\u0928 (\u0930\u093F\u092A\u094B\u0930\u094D\u091F) \u0914\u0930 \u0928\u093F\u092C\u0902\u0927 \u0932\u0947\u0916\u0928"], TB_HI_PENDING, "pending_verification")
      ]
    }
  }
};

// src/data/curriculum.ts
var CLASS_LEVELS = [5, 6, 7, 8, 9, 10];
var SUBJECT_LIST = [
  MATHEMATICS_SUBJECT,
  SCIENCE_SUBJECT,
  PHYSICAL_SCIENCE_SUBJECT,
  LIFE_SCIENCE_SUBJECT,
  HISTORY_SUBJECT,
  GEOGRAPHY_SUBJECT,
  EVS_SUBJECT,
  ENGLISH_SUBJECT,
  BANGLA_SUBJECT,
  HINDI_SUBJECT
];
var ALL_SUBJECTS_BY_ID = {
  mathematics: MATHEMATICS_SUBJECT,
  science: SCIENCE_SUBJECT,
  physical_science: PHYSICAL_SCIENCE_SUBJECT,
  life_science: LIFE_SCIENCE_SUBJECT,
  history: HISTORY_SUBJECT,
  geography: GEOGRAPHY_SUBJECT,
  evs: EVS_SUBJECT,
  history_geography: HISTORY_GEOGRAPHY_LEGACY_SUBJECT,
  english: ENGLISH_SUBJECT,
  bangla: BANGLA_SUBJECT,
  hindi: HINDI_SUBJECT,
  hindi_subject: HINDI_SUBJECT,
  gk: {
    ...SCIENCE_SUBJECT,
    id: "gk",
    name: {
      en: "General Knowledge & Science",
      bn: "\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8",
      hi: "\u0938\u093E\u092E\u093E\u0928\u094D\u092F \u091C\u094D\u091E\u093E\u0928 \u090F\u0935\u0902 \u0935\u093F\u091C\u094D\u091E\u093E\u0928"
    },
    shortDesc: {
      en: "Interdisciplinary science and general awareness curriculum.",
      bn: "\u09AC\u09BF\u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u099C\u09CD\u099E\u09BE\u09A8\u09C7\u09B0 \u09B8\u09AE\u09A8\u09CD\u09AC\u09BF\u09A4 \u09AA\u09BE\u09A0\u09CD\u09AF\u0995\u09CD\u09B0\u09AE\u0964",
      hi: "\u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0914\u0930 \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u091C\u093E\u0917\u0930\u0942\u0915\u0924\u093E \u0915\u093E \u0905\u0902\u0924\u0903\u0935\u093F\u0937\u092F \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E\u0964"
    }
  }
};
function getSubjectDefinition(subjectId) {
  return ALL_SUBJECTS_BY_ID[subjectId] || MATHEMATICS_SUBJECT;
}
var getClassCurriculum = getClassSubjectCurriculum;
function getClassSubjectCurriculum(classLevel, subjectId) {
  const sub = getSubjectDefinition(subjectId);
  const curr = sub.curriculumByClass[classLevel] || sub.curriculumByClass[8];
  if (curr && curr.chapters.length > 0) {
    return curr;
  }
  if (subjectId === "science" && (classLevel === 9 || classLevel === 10)) {
    const ps = PHYSICAL_SCIENCE_SUBJECT.curriculumByClass[classLevel];
    const ls = LIFE_SCIENCE_SUBJECT.curriculumByClass[classLevel];
    return {
      ...curr,
      chapters: [...ps.chapters, ...ls.chapters]
    };
  }
  return curr;
}
function getSubjectsForClass(classLevel) {
  const validClass = CLASS_LEVELS.includes(classLevel) ? classLevel : 8;
  return SUBJECT_LIST.filter((sub) => {
    const curr = sub.curriculumByClass[validClass];
    return Boolean(curr && curr.applicableToClass && curr.chapters.length > 0);
  });
}
function resolveCurriculumChaptersForQuiz(classLevel, subjectId, topicQuery) {
  const curriculum = getClassSubjectCurriculum(classLevel, subjectId);
  const allChapters = curriculum.chapters || [];
  const trimmed = (topicQuery || "").trim();
  if (!trimmed || trimmed === "All Verified Chapters" || trimmed.toLowerCase().includes("all verified chapters") || trimmed.toLowerCase().includes("all chapters")) {
    return {
      curriculum,
      selectedChapters: allChapters,
      isAllChapters: true
    };
  }
  const exactMatch = allChapters.find(
    (ch2) => ch2.id === trimmed || ch2.title.en.toLowerCase() === trimmed.toLowerCase() || ch2.title.bn === trimmed || ch2.title.hi === trimmed
  );
  if (exactMatch) {
    return {
      curriculum,
      selectedChapters: [exactMatch],
      isAllChapters: false
    };
  }
  const partialMatch = allChapters.find(
    (ch2) => ch2.title.en.toLowerCase().includes(trimmed.toLowerCase()) || trimmed.toLowerCase().includes(ch2.title.en.toLowerCase()) || ch2.topics.some((t) => t.toLowerCase().includes(trimmed.toLowerCase()))
  );
  if (partialMatch) {
    return {
      curriculum,
      selectedChapters: [partialMatch],
      isAllChapters: false
    };
  }
  return {
    curriculum,
    selectedChapters: allChapters,
    isAllChapters: true
  };
}

// api/index.ts
if (!process.env.VERCEL && typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {
  }
}
var SUPPORTED_GEMINI_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.5-flash"
];
var configuredModel = (process.env.GEMINI_MODEL || "").trim();
var ACTIVE_GEMINI_MODEL = SUPPORTED_GEMINI_MODELS.includes(configuredModel) ? configuredModel : "gemini-flash-lite-latest";
var modelCooldownUntil = /* @__PURE__ */ new Map();
function recordModelFailureCooldown(modelName, err) {
  const msg = String(err?.message || err || "").toLowerCase();
  const now = Date.now();
  if (msg.includes("404") || msg.includes("not found") || msg.includes("not supported") || msg.includes("no longer available")) {
    modelCooldownUntil.set(modelName, now + 24 * 60 * 60 * 1e3);
    return;
  }
  if (msg.includes("503") || msg.includes("high demand") || msg.includes("unavailable") || msg.includes("service unavailable")) {
    const cooldownMs = 2 * 60 * 1e3;
    modelCooldownUntil.set(modelName, now + cooldownMs);
    if (modelName === "gemini-3.8-flash" || modelName === "gemini-flash-latest") {
      modelCooldownUntil.set("gemini-3.8-flash", now + cooldownMs);
      modelCooldownUntil.set("gemini-flash-latest", now + cooldownMs);
    }
    return;
  }
  if (msg.includes("429") || msg.includes("resource_exhausted") || msg.includes("quota")) {
    const isDailyQuota = msg.includes("perday") || msg.includes("free_tier_requests") || msg.includes("retry in 6h") || msg.includes("retry in 5h") || msg.includes("retry in 4h") || msg.includes("retry in 3h") || msg.includes("retry in 2h") || msg.includes("retry in 1h");
    const cooldownMs = isDailyQuota ? 30 * 60 * 1e3 : 45 * 1e3;
    modelCooldownUntil.set(modelName, now + cooldownMs);
    if (modelName === "gemini-3.8-flash" || modelName === "gemini-flash-latest") {
      modelCooldownUntil.set("gemini-3.8-flash", now + cooldownMs);
      modelCooldownUntil.set("gemini-flash-latest", now + cooldownMs);
    }
  }
}
function getOrderedCandidateModels() {
  const now = Date.now();
  const baseList = Array.from(/* @__PURE__ */ new Set([ACTIVE_GEMINI_MODEL, ...SUPPORTED_GEMINI_MODELS]));
  const available = [];
  const cooledDown = [];
  for (const m of baseList) {
    const until = modelCooldownUntil.get(m) || 0;
    if (until > now) {
      cooledDown.push(m);
    } else {
      available.push(m);
    }
  }
  return [...available, ...cooledDown];
}
var GEMINI_TIMEOUT_MS = 14e3;
var MAX_GENERATION_PASSES = 3;
var MAX_QUESTIONS_PER_CHUNK = 7;
var config = {
  maxDuration: 30
};
function sanitizeLogMessage(msg) {
  if (typeof msg !== "string") {
    msg = msg ? String(msg) : "";
  }
  return msg.replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_API_KEY]").replace(/(?:key|apiKey|token|password|secret)=([^&\s]+)/gi, "$1=[REDACTED]").replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]");
}
function logDiagnostic(stage, details) {
  const safePayload = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    correlationId: details.correlationId || "none",
    stage,
    route: details.route || "unknown",
    model: details.model || void 0,
    status: details.status || void 0,
    durationMs: details.durationMs !== void 0 ? `${details.durationMs}ms` : void 0,
    message: details.message ? sanitizeLogMessage(details.message) : void 0,
    errorName: details.error?.name || void 0,
    errorMessage: details.error ? sanitizeLogMessage(details.error?.message || details.error) : void 0,
    ...details.extra || {}
  };
  console.info(`[IQ Quiz Diagnostic] [${details.correlationId || "SYS"}] [${stage}]`, JSON.stringify(safePayload));
}
function logServerError(context, err, extra) {
  logDiagnostic("SERVER_ERROR", {
    message: context,
    error: err,
    extra
  });
}
function sanitizeEnvApiKey(raw) {
  if (typeof raw !== "string") return "";
  let cleaned = raw.trim();
  if (/^[A-Za-z0-9_]+\s*=/.test(cleaned)) {
    cleaned = cleaned.replace(/^[A-Za-z0-9_]+\s*=\s*/, "").trim();
  }
  cleaned = cleaned.replace(/^["'`]+|["'`]+$/g, "").trim();
  if (!cleaned || cleaned === "MY_GEMINI_API_KEY" || cleaned === "YOUR_GEMINI_API_KEY" || cleaned === "undefined" || cleaned === "null" || cleaned.length <= 10) {
    return "";
  }
  return cleaned;
}
function getServerApiKey() {
  const primaryKey = sanitizeEnvApiKey(process.env.GEMINI_API_KEY);
  if (primaryKey) {
    return primaryKey;
  }
  const serverFallbacks = [
    process.env.GOOGLE_GEMINI_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY,
    process.env.GOOGLE_API_KEY
  ];
  for (const raw of serverFallbacks) {
    const cleaned = sanitizeEnvApiKey(raw);
    if (cleaned) {
      return cleaned;
    }
  }
  if (process.env && typeof process.env === "object") {
    for (const [envKey, envVal] of Object.entries(process.env)) {
      if (envKey.trim().toUpperCase() === "GEMINI_API_KEY") {
        const cleaned = sanitizeEnvApiKey(envVal);
        if (cleaned) {
          return cleaned;
        }
      }
    }
  }
  return "";
}
function getAiClient() {
  const apiKey = getServerApiKey();
  if (!apiKey) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  } catch (err) {
    logServerError("getAiClient initialization failed", err);
    return null;
  }
}
function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then((val) => {
      clearTimeout(timer);
      resolve(val);
    }).catch((err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
async function generateContentWithModelFallback(ai, params) {
  const correlationId = params.correlationId || "req_internal";
  const candidateModels = getOrderedCandidateModels();
  let lastError = null;
  const startTotal = Date.now();
  for (let i = 0; i < candidateModels.length; i++) {
    const modelName = candidateModels[i];
    const startAttempt = Date.now();
    try {
      const isLowLatencyThinking = modelName.includes("3") || modelName.includes("flash-latest") || modelName.includes("flash-lite");
      const thinkingConfig = isLowLatencyThinking ? { thinkingLevel: ThinkingLevel.LOW } : void 0;
      const mergedConfig = {
        ...params.config || {},
        ...thinkingConfig ? { thinkingConfig } : {}
      };
      logDiagnostic("MODEL_ATTEMPT_START", {
        correlationId,
        model: modelName,
        message: `Calling model ${modelName} (attempt ${i + 1}/${candidateModels.length})`
      });
      const response = await withTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: mergedConfig
        }),
        GEMINI_TIMEOUT_MS,
        `Gemini generateContent (${modelName})`
      );
      const attemptDuration = Date.now() - startAttempt;
      modelCooldownUntil.delete(modelName);
      logDiagnostic("MODEL_ATTEMPT_SUCCESS", {
        correlationId,
        model: modelName,
        durationMs: attemptDuration,
        message: `Generated successfully with ${modelName} in ${attemptDuration}ms`
      });
      return {
        response,
        modelUsed: modelName,
        durationMs: Date.now() - startTotal
      };
    } catch (err) {
      lastError = err;
      const attemptDuration = Date.now() - startAttempt;
      const msg = String(err?.message || err || "").toLowerCase();
      const status = err?.status || err?.statusCode;
      logDiagnostic("MODEL_ATTEMPT_FAILED", {
        correlationId,
        model: modelName,
        status,
        durationMs: attemptDuration,
        error: err
      });
      if (status === 401 || status === 403 || msg.includes("api_key_invalid") || msg.includes("api key not valid") || msg.includes("invalid api key") || msg.includes("permission_denied")) {
        logDiagnostic("AUTH_ERROR_ABORT", {
          correlationId,
          model: modelName,
          status: status || 401,
          message: "Gemini API authentication rejected. Aborting model fallback chain."
        });
        break;
      }
      recordModelFailureCooldown(modelName, err);
      if (i < candidateModels.length - 1) {
        logDiagnostic("MODEL_SWITCHING", {
          correlationId,
          model: modelName,
          message: `Switching to fallback model ${candidateModels[i + 1]}`
        });
      }
    }
  }
  throw lastError || new Error("Gemini API request failed across all available models.");
}
function parseGeminiJsonSafe(rawText) {
  if (!rawText || typeof rawText !== "string") return null;
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  if (!cleaned) return null;
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
      } catch {
      }
    }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {
      }
    }
    return null;
  }
}
function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  if (typeof res.status === "function") {
    try {
      res.status(statusCode);
    } catch {
    }
  }
  if (typeof res.setHeader === "function") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  }
  if (typeof res.json === "function") {
    res.json(payload);
  } else if (typeof res.end === "function") {
    res.end(body);
  }
}
async function readJsonBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === "string") {
    const trimmed = req.body.trim();
    if (!trimmed) return {};
    try {
      return JSON.parse(trimmed);
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    const str = req.body.toString("utf8").trim();
    if (!str) return {};
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = "";
    if (typeof req.on !== "function") {
      resolve({});
      return;
    }
    req.on("data", (chunk) => {
      raw += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
    });
    req.on("end", () => {
      const trimmed = raw.trim();
      if (!trimmed) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(trimmed));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}
function resolveRoutePath(req) {
  const rawUrl = String(req.originalUrl || req.url || "/");
  const [pathnamePart, queryPart] = rawUrl.split("?");
  if (req.query && typeof req.query.__path === "string" && req.query.__path.trim()) {
    const p = req.query.__path.trim().replace(/^\/+/, "");
    return `/api/${p}`;
  }
  if (queryPart) {
    try {
      const params = new URLSearchParams(queryPart);
      const rewrittenPath = params.get("__path");
      if (rewrittenPath && rewrittenPath.trim()) {
        return `/api/${rewrittenPath.trim().replace(/^\/+/, "")}`;
      }
    } catch {
    }
  }
  let cleanPath = pathnamePart.replace(/\/+$/, "") || "/";
  if (!cleanPath.startsWith("/api/") && (cleanPath.startsWith("/quiz/") || cleanPath.startsWith("/notes/") || cleanPath.startsWith("/ai/"))) {
    cleanPath = `/api${cleanPath}`;
  }
  return cleanPath;
}
var MULTILINGUAL_STOPWORDS = /* @__PURE__ */ new Set([
  // English
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "into",
  "about",
  "which",
  "what",
  "who",
  "whom",
  "whose",
  "when",
  "where",
  "why",
  "how",
  "following",
  "choose",
  "select",
  "correct",
  "option",
  "answer",
  "find",
  "calculate",
  "determine",
  "value",
  "statement",
  "true",
  "false",
  "according",
  "class",
  "if",
  "then",
  "that",
  "this",
  "these",
  "those",
  "an",
  "a",
  "and",
  "or",
  "but",
  "not",
  "does",
  "do",
  "did",
  "has",
  "have",
  "had",
  "will",
  "would",
  "can",
  "could",
  "should",
  "called",
  "known",
  // Bengali
  "\u098F\u09AC\u0982",
  "\u09AC\u09BE",
  "\u0995\u09BF\u09A8\u09CD\u09A4\u09C1",
  "\u09AF\u09A6\u09BF",
  "\u09A4\u09AC\u09C7",
  "\u09B9\u09AF\u09BC",
  "\u09B9\u09AC\u09C7",
  "\u099B\u09BF\u09B2",
  "\u0995\u09B0\u09C7",
  "\u0995\u09B0\u09BE",
  "\u09A5\u09C7\u0995\u09C7",
  "\u099C\u09A8\u09CD\u09AF",
  "\u09AE\u09A7\u09CD\u09AF\u09C7",
  "\u0995\u09CB\u09A8",
  "\u0995\u09CB\u09A8\u099F\u09BF",
  "\u0995\u09C0",
  "\u0995\u09BF",
  "\u0995\u09A4",
  "\u0995\u09C7",
  "\u0995\u09CB\u09A5\u09BE\u09AF\u09BC",
  "\u0995\u09C7\u09A8",
  "\u0995\u09BF\u09AD\u09BE\u09AC\u09C7",
  "\u09B8\u09A0\u09BF\u0995",
  "\u0989\u09A4\u09CD\u09A4\u09B0",
  "\u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC",
  "\u0995\u09B0\u09CB",
  "\u09AC\u09B2\u09A4\u09C7",
  "\u09AC\u09B2\u09BE",
  "\u09A8\u09BF\u099A\u09C7\u09B0",
  "\u09AA\u09CD\u09B0\u09A6\u09A4\u09CD\u09A4",
  "\u0985\u09A8\u09C1\u09AF\u09BE\u09AF\u09BC\u09C0",
  "\u09B6\u09CD\u09B0\u09C7\u09A3\u09BF",
  "\u098F\u0995\u099F\u09BF",
  "\u09A6\u09C1\u099F\u09BF",
  "\u098F\u09B0",
  "\u098F\u0987",
  "\u0993\u0987",
  "\u09B8\u09C7\u0987",
  "\u09A4\u09BE",
  "\u09AF\u09BE",
  "\u09AF\u09C7",
  "\u09A8\u09BE",
  "\u09A8\u09AF\u09BC",
  "\u09B9\u09B2\u09CB",
  "\u09B9\u09B2",
  // Hindi
  "\u0915\u093E",
  "\u0915\u0940",
  "\u0915\u0947",
  "\u092E\u0947\u0902",
  "\u0938\u0947",
  "\u0915\u094B",
  "\u092A\u0930",
  "\u0914\u0930",
  "\u092F\u093E",
  "\u0915\u093F\u0928\u094D\u0924\u0941",
  "\u092A\u0930\u0928\u094D\u0924\u0941",
  "\u092F\u0926\u093F",
  "\u0924\u094B",
  "\u0939\u0948",
  "\u0939\u0948\u0902",
  "\u0925\u093E",
  "\u0925\u0947",
  "\u0925\u0940",
  "\u0939\u094B\u0924\u093E",
  "\u0939\u094B\u0924\u0940",
  "\u0939\u094B\u0924\u0947",
  "\u0939\u094B\u0917\u093E",
  "\u0939\u094B\u0917\u0940",
  "\u0915\u094C\u0928",
  "\u0915\u094D\u092F\u093E",
  "\u0915\u092C",
  "\u0915\u0939\u093E\u0901",
  "\u0915\u094D\u092F\u094B\u0902",
  "\u0915\u0948\u0938\u0947",
  "\u0915\u093F\u0924\u0928\u093E",
  "\u0915\u093F\u0924\u0928\u0940",
  "\u0915\u093F\u0924\u0928\u0947",
  "\u0938\u0939\u0940",
  "\u0909\u0924\u094D\u0924\u0930",
  "\u0935\u093F\u0915\u0932\u094D\u092A",
  "\u091A\u0941\u0928\u0947\u0902",
  "\u091C\u094D\u091E\u093E\u0924",
  "\u0915\u0940\u091C\u093F\u090F",
  "\u0928\u093F\u092E\u094D\u0928\u0932\u093F\u0916\u093F\u0924",
  "\u0905\u0928\u0941\u0938\u093E\u0930",
  "\u0915\u0915\u094D\u0937\u093E",
  "\u090F\u0915",
  "\u092F\u0939",
  "\u0935\u0939",
  "\u0907\u0938",
  "\u0909\u0938",
  "\u0915\u0939\u093E",
  "\u091C\u093E\u0924\u093E",
  "\u091C\u093E\u0924\u0940",
  "\u0926\u094D\u0935\u093E\u0930\u093E",
  "\u0932\u093F\u090F",
  "\u0928\u0939\u0940\u0902"
]);
function normalizeDigitsToHash(text) {
  return (text || "").replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 2534)).replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 2406)).replace(/\b\d+(?:[.,]\d+)*\b/g, "#NUM#");
}
function computeFingerprint(text) {
  const normalized = (text || "").toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, " ").trim();
  return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}
function extractContentTokens(text) {
  const digitNormalized = normalizeDigitsToHash(text).toLowerCase();
  const rawTokens = digitNormalized.replace(/[^\p{L}\p{M}#]+/gu, " ").split(/\s+/).map((t) => t.trim()).filter((t) => t.length >= 2 && t !== "#num#" && !MULTILINGUAL_STOPWORDS.has(t));
  return rawTokens;
}
function computeStructuralHash(text) {
  const tokens = extractContentTokens(text);
  const skeleton = tokens.length > 0 ? tokens.join(" ") : normalizeDigitsToHash(text).toLowerCase().trim();
  return crypto.createHash("sha256").update(skeleton).digest("hex").slice(0, 16);
}
function computeTrigramSet(text) {
  const cleaned = normalizeDigitsToHash(text).toLowerCase().replace(/[^\p{L}\p{M}#]+/gu, " ").replace(/\s+/g, " ").trim();
  const trigrams = /* @__PURE__ */ new Set();
  if (cleaned.length < 3) {
    if (cleaned) trigrams.add(cleaned);
    return trigrams;
  }
  for (let i = 0; i <= cleaned.length - 3; i++) {
    trigrams.add(cleaned.slice(i, i + 3));
  }
  return trigrams;
}
function computeSetJaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union > 0 ? intersection / union : 0;
}
function computeSetDice(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  return 2 * intersection / (a.size + b.size);
}
function isQuestionDuplicateOrSimilar(candidate, existingEntries, excludedFingerprintsSet) {
  if (excludedFingerprintsSet.has(candidate.fingerprint)) {
    return { duplicate: true, reason: "exact_fingerprint_match" };
  }
  const candTokens = new Set(extractContentTokens(candidate.questionText));
  const candTrigrams = computeTrigramSet(candidate.questionText);
  const candConceptTokens = new Set(
    candidate.conceptKey.toLowerCase().split("_").filter((t) => t.length >= 3 && !MULTILINGUAL_STOPWORDS.has(t))
  );
  const candNormalizedOpts = new Set(
    candidate.options.map(
      (o) => o.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, "").trim()
    ).filter(Boolean)
  );
  for (const prev of existingEntries) {
    if (!prev) continue;
    if (prev.fingerprint && prev.fingerprint === candidate.fingerprint) {
      return { duplicate: true, reason: "exact_fingerprint" };
    }
    if (prev.structuralHash && prev.structuralHash === candidate.structuralHash && candTokens.size >= 3) {
      return { duplicate: true, reason: "identical_structural_skeleton" };
    }
    if (prev.conceptKey && candidate.conceptKey) {
      const pKey = prev.conceptKey.toLowerCase().trim();
      const cKey = candidate.conceptKey.toLowerCase().trim();
      if (pKey === cKey) {
        return { duplicate: true, reason: `repeated_concept_key (${cKey})` };
      }
      const prevConceptTokens = new Set(
        pKey.split("_").filter((t) => t.length >= 3 && !MULTILINGUAL_STOPWORDS.has(t))
      );
      if (candConceptTokens.size >= 2 && prevConceptTokens.size >= 2) {
        const conceptOverlap = computeSetJaccard(candConceptTokens, prevConceptTokens);
        if (conceptOverlap >= 0.78) {
          return { duplicate: true, reason: `similar_concept_key (${cKey} ~ ${pKey})` };
        }
      }
    }
    if (prev.questionText && prev.questionText.trim().length > 5) {
      const prevTokens = new Set(extractContentTokens(prev.questionText));
      const tokenJaccard = computeSetJaccard(candTokens, prevTokens);
      if (tokenJaccard >= 0.52) {
        return {
          duplicate: true,
          reason: `high_semantic_word_similarity (${Math.round(tokenJaccard * 100)}%)`
        };
      }
      const prevTrigrams = computeTrigramSet(prev.questionText);
      const trigramDice = computeSetDice(candTrigrams, prevTrigrams);
      if (trigramDice >= 0.64) {
        return {
          duplicate: true,
          reason: `high_trigram_similarity (${Math.round(trigramDice * 100)}%)`
        };
      }
      if (tokenJaccard >= 0.35 && Array.isArray(prev.options) && prev.options.length > 0) {
        const prevOpts = new Set(
          prev.options.map(
            (o) => String(o || "").toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, "").trim()
          ).filter(Boolean)
        );
        let sharedOptions = 0;
        for (const opt of candNormalizedOpts) {
          if (prevOpts.has(opt)) sharedOptions++;
        }
        if (sharedOptions >= 2) {
          return {
            duplicate: true,
            reason: "similar_stem_and_shared_answer_options"
          };
        }
      }
    }
  }
  return { duplicate: false };
}
var userHistoryStore = /* @__PURE__ */ new Map();
function getUserServerHistory(userId) {
  if (!userHistoryStore.has(userId)) {
    userHistoryStore.set(userId, []);
  }
  return userHistoryStore.get(userId);
}
function recordQuestionsInServerHistory(userId, questions) {
  const list = getUserServerHistory(userId);
  const existingFps = new Set(list.map((item) => item.fingerprint));
  for (const q of questions) {
    if (!existingFps.has(q.fingerprint)) {
      existingFps.add(q.fingerprint);
      list.push({
        fingerprint: q.fingerprint,
        structuralHash: q.structuralHash,
        conceptKey: q.conceptKey,
        questionText: q.questionText,
        options: q.options,
        classLevel: q.classLevel,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty
      });
    }
  }
  if (list.length > 500) {
    list.splice(0, list.length - 500);
  }
}
var SUBJECT_SUBTOPIC_POOL = {
  mathematics: [
    "Number System, Prime Factorization, HCF & LCM Word Problems",
    "Fractions, Decimals, Rational & Irrational Numbers",
    "Ratio, Proportion, Unitary Method & Partnership",
    "Percentage, Profit & Loss, Discount & Overhead Charges",
    "Simple Interest, Compound Interest & Uniform Rate of Growth",
    "Time, Distance, Relative Speed & Work-Rate Problems",
    "Algebraic Expressions, Identities, Factorization & Polynomials",
    "Linear Equations, Simultaneous Equations & Quadratic Roots",
    "Laws of Indices, Exponents, Surds & Logarithmic Relations",
    "Lines, Angles, Parallel Transversals & Polygon Interior Angles",
    "Triangle Congruence, Similarity, Pythagoras Theorem & Inequalities",
    "Quadrilaterals, Parallelograms, Rhombus & Trapezium Properties",
    "Circle Chords, Tangents, Cyclic Quadrilaterals & Subtended Angles",
    "Perimeter & Area of Plane Figures, Sectors, Rings & Pathways",
    "Surface Area & Volume of Cube, Cuboid, Cylinder, Cone & Sphere",
    "Coordinate Geometry, Distance Formula, Section Formula & Graphs",
    "Trigonometric Ratios, Standard Angles, Identities & Heights/Distances",
    "Statistics, Mean, Median, Mode, Frequency Polygons & Probability"
  ],
  physical_science: [
    "Measurement, SI Units, Dimensional Analysis & Scalar/Vector Quantities",
    "Rest & Motion, Displacement, Velocity, Acceleration & Equations of Motion",
    "Newton\u2019s Laws of Motion, Momentum Conservation, Impulse & Friction",
    "Work, Power, Mechanical Energy, Kinetic & Potential Energy Conservation",
    "Gravitation, Acceleration due to Gravity, Weight & Archimedes Buoyancy",
    "Pressure in Fluids, Pascal\u2019s Law, Atmospheric Pressure & Barometer",
    "Heat, Temperature Scales, Specific Heat, Latent Heat & Calorimetry",
    "Thermal Expansion of Solids, Liquids, Gases & Heat Transfer Modes",
    "Reflection of Light, Plane & Spherical Mirrors, Magnification & Ray Diagrams",
    "Refraction of Light, Snell\u2019s Law, Total Internal Reflection, Lenses & Prism",
    "Sound Waves, Frequency, Wavelength, Echo, Sonar & Audible Range",
    "Current Electricity, Ohm\u2019s Law, Series/Parallel Resistors, Joule\u2019s Heating & Power",
    "Electromagnetism, Fleming\u2019s Rules, Electric Motor & Electromagnetic Induction",
    "Atomic Structure, Isotopes, Isobars, Electronic Configuration & Periodic Table Trends",
    "Chemical Bonding (Ionic & Covalent), Valency, Oxidation & Reduction Reactions",
    "Acids, Bases, Salts, pH Scale, Neutralization & Indicators",
    "Gas Laws (Boyle\u2019s Law, Charles\u2019s Law, Avogadro\u2019s Law, Ideal Gas Equation & Mole Concept)",
    "Metallurgy, Ores, Alloys, Corrosion, Carbon Compounds & Functional Groups"
  ],
  life_science: [
    "Cell Structure, Prokaryotic vs Eukaryotic Cells & Cell Organelles Functions",
    "Cell Division: Mitosis, Meiosis, Chromosome Structure, DNA & Cell Cycle",
    "Plant & Animal Tissues: Meristematic, Permanent, Xylem, Phloem, Epithelial & Muscular",
    "Photosynthesis: Light & Dark Phases, Pigments, Stomatal Opening & Significance",
    "Respiration: Aerobic, Anaerobic, Glycolysis, Krebs Cycle & Respiratory Organs",
    "Plant Nutrition, Transpiration, Ascent of Sap, Mineral Deficiency & Tropism",
    "Human Digestive System, Enzymes, Peristalsis, Liver, Pancreas & Assimilation",
    "Circulatory System: Heart Chambers, Double Circulation, Blood Groups, Lymph & ECG",
    "Excretory System: Nephron Structure, Ultrafiltration, Osmoregulation & Plant Excretion",
    "Nervous System: Neuron, Synapse, Reflex Arc, Brain Regions & Cranial/Spinal Nerves",
    "Endocrine System: Pituitary, Thyroid, Adrenal, Pancreas Hormones & Feedback Control",
    "Plant Hormones (Auxin, Gibberellin, Cytokinin) & Photoperiodism",
    "Reproduction in Plants & Animals, Pollination, Double Fertilization & Vegetative Propagation",
    "Genetics & Heredity: Mendel\u2019s Laws, Monohybrid/Dihybrid Cross, Sex Determination & Genetic Disorders",
    "Evolution: Lamarckism, Darwinism, Natural Selection, Homologous/Analogous Organs & Fossils",
    "Microorganisms, Immunity, Vaccination, Antibiotics, Pathogens & Human Diseases",
    "Ecology, Food Chains, Energy Flow, Nitrogen Cycle, Biodiversity Conservation & Hotspots"
  ],
  english: [
    "Parts of Speech, Articles, Prepositions & Phrasal Verbs in Context",
    "Tenses, Sequence of Tenses, Subject-Verb Agreement & Conditional Clauses",
    "Active and Passive Voice Transformation across Tenses & Imperatives",
    "Direct and Indirect (Reported) Speech: Statements, Questions & Commands",
    "Synthesis & Transformation of Sentences: Simple, Complex & Compound",
    "Clauses: Noun Clause, Adjective/Relative Clause & Adverbial Clause Identification",
    "Non-Finite Verbs: Infinitives, Gerunds & Participles Usage",
    "Vocabulary: Synonyms, Antonyms, Homophones, One-Word Substitution & Idioms",
    "Prefixes, Suffixes, Word Formation, Spelling Rules & Punctuation",
    "Figures of Speech: Simile, Metaphor, Personification, Alliteration & Irony",
    "Reading Comprehension Inference, Tone Analysis & Contextual Meaning",
    "WBBSE Classic Prose & Poetry Themes, Character Analysis & Literary Devices"
  ],
  bangla: [
    "\u09A7\u09CD\u09AC\u09A8\u09BF\u09A4\u09A4\u09CD\u09A4\u09CD\u09AC \u0993 \u09AC\u09B0\u09CD\u09A3\u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3: \u09B8\u09CD\u09AC\u09B0\u09A7\u09CD\u09AC\u09A8\u09BF, \u09AC\u09CD\u09AF\u099E\u09CD\u099C\u09A8\u09A7\u09CD\u09AC\u09A8\u09BF, \u0989\u099A\u09CD\u099A\u09BE\u09B0\u09A3 \u09B8\u09CD\u09A5\u09BE\u09A8 \u0993 \u09AE\u09BE\u09A4\u09CD\u09B0\u09BE",
    "\u09B8\u09A8\u09CD\u09A7\u09BF \u09AC\u09BF\u099A\u09CD\u099B\u09C7\u09A6 \u0993 \u09B8\u09A8\u09CD\u09A7\u09BF\u09AC\u09A6\u09CD\u09A7 \u09AA\u09A6: \u09B8\u09CD\u09AC\u09B0\u09B8\u09A8\u09CD\u09A7\u09BF, \u09AC\u09CD\u09AF\u099E\u09CD\u099C\u09A8\u09B8\u09A8\u09CD\u09A7\u09BF \u0993 \u09AC\u09BF\u09B8\u09B0\u09CD\u0997\u09B8\u09A8\u09CD\u09A7\u09BF",
    "\u09B6\u09AC\u09CD\u09A6\u09AD\u09BE\u09A3\u09CD\u09A1\u09BE\u09B0: \u09A4\u09CE\u09B8\u09AE, \u09A4\u09A6\u09CD\u09AD\u09AC, \u09A6\u09C7\u09B6\u09BF, \u09AC\u09BF\u09A6\u09C7\u09B6\u09BF, \u09AF\u09CC\u0997\u09BF\u0995 \u0993 \u09AF\u09CB\u0997\u09B0\u09C2\u09A2\u09BC \u09B6\u09AC\u09CD\u09A6",
    "\u09AA\u09A6 \u09AA\u09CD\u09B0\u0995\u09B0\u09A3 \u0993 \u09AA\u09A6 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8: \u09AC\u09BF\u09B6\u09C7\u09B7\u09CD\u09AF \u09A5\u09C7\u0995\u09C7 \u09AC\u09BF\u09B6\u09C7\u09B7\u09A3 \u098F\u09AC\u0982 \u09B8\u09B0\u09CD\u09AC\u09A8\u09BE\u09AE \u0993 \u0985\u09AC\u09CD\u09AF\u09AF\u09BC\u09C7\u09B0 \u09B6\u09CD\u09B0\u09C7\u09A3\u09BF\u09AC\u09BF\u09AD\u09BE\u0997",
    "\u0995\u09BE\u09B0\u0995 \u0993 \u09AC\u09BF\u09AD\u0995\u09CD\u09A4\u09BF \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC: \u0995\u09B0\u09CD\u09A4\u09C3, \u0995\u09B0\u09CD\u09AE, \u0995\u09B0\u09A3, \u09A8\u09BF\u09AE\u09BF\u09A4\u09CD\u09A4, \u0985\u09AA\u09BE\u09A6\u09BE\u09A8 \u0993 \u0985\u09A7\u09BF\u0995\u09B0\u09A3 \u0995\u09BE\u09B0\u0995",
    "\u09B8\u09AE\u09BE\u09B8 \u09A8\u09BF\u09B0\u09CD\u09A3\u09AF\u09BC \u0993 \u09AC\u09CD\u09AF\u09BE\u09B8\u09AC\u09BE\u0995\u09CD\u09AF: \u09A6\u09CD\u09AC\u09A8\u09CD\u09A6\u09CD\u09AC, \u09A4\u09CE\u09AA\u09C1\u09B0\u09C1\u09B7, \u0995\u09B0\u09CD\u09AE\u09A7\u09BE\u09B0\u09AF\u09BC, \u09AC\u09B9\u09C1\u09AC\u09CD\u09B0\u09C0\u09B9\u09BF, \u09A6\u09CD\u09AC\u09BF\u0997\u09C1 \u0993 \u0985\u09AC\u09CD\u09AF\u09AF\u09BC\u09C0\u09AD\u09BE\u09AC",
    "\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09AF\u09BC, \u0989\u09AA\u09B8\u09B0\u09CD\u0997 \u0993 \u0985\u09A8\u09C1\u09B8\u09B0\u09CD\u0997: \u0995\u09C3\u09A4\u09CD \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09AF\u09BC \u0993 \u09A4\u09A6\u09CD\u09A7\u09BF\u09A4 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09AF\u09BC\u09C7\u09B0 \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u0997",
    "\u09AC\u09BE\u0995\u09CD\u09AF\u09A4\u09A4\u09CD\u09A4\u09CD\u09AC \u0993 \u09AC\u09BE\u0995\u09CD\u09AF \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8: \u09B8\u09B0\u09B2, \u099C\u099F\u09BF\u09B2, \u09AF\u09CC\u0997\u09BF\u0995 \u098F\u09AC\u0982 \u0995\u09B0\u09CD\u09A4\u09C3\u09AC\u09BE\u099A\u09CD\u09AF, \u0995\u09B0\u09CD\u09AE\u09AC\u09BE\u099A\u09CD\u09AF \u0993 \u09AD\u09BE\u09AC\u09AC\u09BE\u099A\u09CD\u09AF",
    "\u09B6\u09AC\u09CD\u09A6\u09BE\u09B0\u09CD\u09A5: \u09B8\u09AE\u09BE\u09B0\u09CD\u09A5\u0995 \u09B6\u09AC\u09CD\u09A6, \u09AC\u09BF\u09AA\u09B0\u09C0\u09A4\u09BE\u09B0\u09CD\u09A5\u0995 \u09B6\u09AC\u09CD\u09A6, \u09B8\u09AE\u09CB\u099A\u09CD\u099A\u09BE\u09B0\u09BF\u09A4 \u09AD\u09BF\u09A8\u09CD\u09A8\u09BE\u09B0\u09CD\u09A5\u0995 \u09B6\u09AC\u09CD\u09A6 \u0993 \u098F\u0995\u0995\u09A5\u09BE\u09AF\u09BC \u09AA\u09CD\u09B0\u0995\u09BE\u09B6",
    "\u09AC\u09BE\u0997\u09A7\u09BE\u09B0\u09BE, \u09AA\u09CD\u09B0\u09AC\u09BE\u09A6-\u09AA\u09CD\u09B0\u09AC\u099A\u09A8, \u09AC\u09BE\u09A8\u09BE\u09A8 \u09B6\u09C1\u09A6\u09CD\u09A7\u09BF\u0995\u09B0\u09A3 \u0993 \u09AF\u09A4\u09BF\u099A\u09BF\u09B9\u09CD\u09A8\u09C7\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0",
    "\u09AC\u09BE\u0982\u09B2\u09BE \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF\u09C7\u09B0 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u0993 \u09AA\u09BE\u09A0\u09CD\u09AF\u09AA\u09C1\u09B8\u09CD\u09A4\u0995: \u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5, \u09A8\u099C\u09B0\u09C1\u09B2, \u09B6\u09B0\u09CE\u099A\u09A8\u09CD\u09A6\u09CD\u09B0, \u09B8\u09C1\u0995\u09C1\u09AE\u09BE\u09B0 \u09B0\u09BE\u09AF\u09BC \u0993 \u09AC\u09BF\u09AD\u09C2\u09A4\u09BF\u09AD\u09C2\u09B7\u09A3"
  ],
  hindi: [
    "\u0935\u0930\u094D\u0923\u092E\u093E\u0932\u093E \u090F\u0935\u0902 \u0927\u094D\u0935\u0928\u093F \u0935\u093F\u091A\u093E\u0930: \u0938\u094D\u0935\u0930, \u0935\u094D\u092F\u0902\u091C\u0928, \u0909\u091A\u094D\u091A\u093E\u0930\u0923 \u0938\u094D\u0925\u093E\u0928, \u0905\u0932\u094D\u092A\u092A\u094D\u0930\u093E\u0923 \u090F\u0935\u0902 \u092E\u0939\u093E\u092A\u094D\u0930\u093E\u0923",
    "\u0938\u0902\u0927\u093F \u090F\u0935\u0902 \u0938\u0902\u0927\u093F-\u0935\u093F\u091A\u094D\u091B\u0947\u0926: \u0938\u094D\u0935\u0930 \u0938\u0902\u0927\u093F (\u0926\u0940\u0930\u094D\u0918, \u0917\u0941\u0923, \u0935\u0943\u0926\u094D\u0927\u093F, \u092F\u0923, \u0905\u092F\u093E\u0926\u093F), \u0935\u094D\u092F\u0902\u091C\u0928 \u090F\u0935\u0902 \u0935\u093F\u0938\u0930\u094D\u0917 \u0938\u0902\u0927\u093F",
    "\u0936\u092C\u094D\u0926 \u092D\u0947\u0926: \u0924\u0924\u094D\u0938\u092E, \u0924\u0926\u094D\u092D\u0935, \u0926\u0947\u0936\u091C, \u0935\u093F\u0926\u0947\u0936\u091C \u0924\u0925\u093E \u0930\u0942\u0922\u093C, \u092F\u094C\u0917\u093F\u0915 \u090F\u0935\u0902 \u092F\u094B\u0917\u0930\u0942\u0922\u093C \u0936\u092C\u094D\u0926",
    "\u0938\u0902\u091C\u094D\u091E\u093E, \u0938\u0930\u094D\u0935\u0928\u093E\u092E, \u0935\u093F\u0936\u0947\u0937\u0923, \u0915\u094D\u0930\u093F\u092F\u093E \u090F\u0935\u0902 \u0905\u0935\u094D\u092F\u092F \u0915\u0947 \u092D\u0947\u0926 \u0924\u0925\u093E \u0930\u0942\u092A\u093E\u0928\u094D\u0924\u0930\u0923",
    "\u0915\u093E\u0930\u0915 \u090F\u0935\u0902 \u0935\u093F\u092D\u0915\u094D\u0924\u093F \u091A\u093F\u0939\u094D\u0928: \u0915\u0930\u094D\u0924\u093E \u0938\u0947 \u0905\u0927\u093F\u0915\u0930\u0923 \u0914\u0930 \u0938\u0902\u092C\u094B\u0927\u0928 \u0915\u093E\u0930\u0915 \u0915\u0940 \u092A\u0939\u091A\u093E\u0928",
    "\u0938\u092E\u093E\u0938 \u0935\u093F\u0917\u094D\u0930\u0939 \u090F\u0935\u0902 \u092D\u0947\u0926: \u0905\u0935\u094D\u092F\u092F\u0940\u092D\u093E\u0935, \u0924\u0924\u094D\u092A\u0941\u0930\u0941\u0937, \u0915\u0930\u094D\u092E\u0927\u093E\u0930\u092F, \u0926\u094D\u0935\u093F\u0917\u0941, \u0926\u094D\u0935\u0928\u094D\u0926\u094D\u0935 \u090F\u0935\u0902 \u092C\u0939\u0941\u092C\u094D\u0930\u0940\u0939\u093F \u0938\u092E\u093E\u0938",
    "\u0909\u092A\u0938\u0930\u094D\u0917 \u090F\u0935\u0902 \u092A\u094D\u0930\u0924\u094D\u092F\u092F: \u092E\u0942\u0932 \u0936\u092C\u094D\u0926 \u0938\u0947 \u0909\u092A\u0938\u0930\u094D\u0917 \u0914\u0930 \u092A\u094D\u0930\u0924\u094D\u092F\u092F \u0905\u0932\u0917 \u0915\u0930\u0928\u093E",
    "\u0935\u093E\u0915\u094D\u092F \u0935\u093F\u091A\u093E\u0930 \u090F\u0935\u0902 \u0930\u0942\u092A\u093E\u0902\u0924\u0930\u0923: \u0938\u0930\u0932, \u0938\u0902\u092F\u0941\u0915\u094D\u0924, \u092E\u093F\u0936\u094D\u0930 \u0935\u093E\u0915\u094D\u092F \u0924\u0925\u093E \u0915\u0930\u094D\u0924\u0943\u0935\u093E\u091A\u094D\u092F, \u0915\u0930\u094D\u092E\u0935\u093E\u091A\u094D\u092F, \u092D\u093E\u0935\u0935\u093E\u091A\u094D\u092F",
    "\u092A\u0930\u094D\u092F\u093E\u092F\u0935\u093E\u091A\u0940 \u0936\u092C\u094D\u0926, \u0935\u093F\u0932\u094B\u092E \u0936\u092C\u094D\u0926, \u0905\u0928\u0947\u0915\u093E\u0930\u094D\u0925\u0940 \u0936\u092C\u094D\u0926 \u090F\u0935\u0902 \u0935\u093E\u0915\u094D\u092F\u093E\u0902\u0936 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u0936\u092C\u094D\u0926",
    "\u092E\u0941\u0939\u093E\u0935\u0930\u0947, \u0932\u094B\u0915\u094B\u0915\u094D\u0924\u093F\u092F\u093E\u0901, \u0935\u0930\u094D\u0924\u0928\u0940 \u0936\u0941\u0926\u094D\u0927\u093F\u0915\u0930\u0923 \u090F\u0935\u0902 \u0935\u093F\u0930\u093E\u092E \u091A\u093F\u0939\u094D\u0928",
    "\u0905\u0932\u0902\u0915\u093E\u0930 \u090F\u0935\u0902 \u091B\u0902\u0926: \u0905\u0928\u0941\u092A\u094D\u0930\u093E\u0938, \u092F\u092E\u0915, \u0936\u094D\u0932\u0947\u0937, \u0909\u092A\u092E\u093E, \u0930\u0942\u092A\u0915 \u090F\u0935\u0902 \u092E\u093E\u0928\u0935\u0940\u0915\u0930\u0923 \u0905\u0932\u0902\u0915\u093E\u0930",
    "\u0939\u093F\u0902\u0926\u0940 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u090F\u0935\u0902 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915: \u092A\u094D\u0930\u0947\u092E\u091A\u0902\u0926, \u0915\u092C\u0940\u0930, \u0938\u0942\u0930\u0926\u093E\u0938, \u0924\u0941\u0932\u0938\u0940\u0926\u093E\u0938, \u092E\u0939\u093E\u0926\u0947\u0935\u0940 \u0935\u0930\u094D\u092E\u093E \u090F\u0935\u0902 \u0926\u093F\u0928\u0915\u0930"
  ],
  gk: [
    "Indian Freedom Struggle, Key Movements, Dates, Leaders & Historical Treaties",
    "Indian Constitution, Fundamental Rights, Parliament, President, Supreme Court & Amendments",
    "Geography of India & West Bengal: Rivers, Mountain Passes, Soil, Climate & National Parks",
    "Solar System, Astronomy, ISRO Space Missions (Chandrayaan, Aditya-L1, Gaganyaan) & Satellites",
    "Nobel Laureates, Bharat Ratna, Major Literary Awards, Sports Trophies & Olympic Records",
    "Inventions, Scientific Discoveries, Diagnostic Instruments, SI Units & Famous Scientists",
    "World Geography: Continents, Oceans, Straits, Capitals, Currencies & International Boundaries",
    "United Nations Agencies (UNESCO, UNICEF, WHO, WTO, IMF), Headquarters & Global Summits",
    "Indian Economy, RBI, Five-Year Plans, National Symbols, Classical Dances & UNESCO Heritage Sites",
    "Environmental Science, Ramsar Wetlands, Biosphere Reserves, Renewable Energy & Climate Treaties",
    "Computer Fundamentals, Networking, Cybersecurity, Supercomputers & Modern Technology",
    "Human Body Facts, Vitamins, Deficiency Diseases, Vaccines & Medical Milestones"
  ]
};
var SUBJECT_DOMAIN_GUARDRAILS = {
  mathematics: "STRICT DOMAIN GUARDRAIL (MATHEMATICS): Generate ONLY authentic mathematical problems, numerical calculations, algebraic manipulations, geometric proofs/properties, mensuration, trigonometry, coordinate geometry, or statistics strictly from the prescribed WBBPE/WBBSE Mathematics textbook. Every calculation must be 100% verified.",
  science: "STRICT DOMAIN GUARDRAIL (ENVIRONMENT & SCIENCE \u2014 PARIBESH O BIGYAN): Generate ONLY scientific questions (Physics, Chemistry, Biology, Environmental Science) strictly grounded in the prescribed WBBSE Paribesh o Bigyan textbook for this class.",
  physical_science: "STRICT DOMAIN GUARDRAIL (PHYSICAL SCIENCE \u2014 BHOUTO BIGYAN O PARIBESH): Generate ONLY Physics and Chemistry questions (SI units, motion, force, heat, light, sound, electricity, atomic structure, gas laws, periodic table, chemical bonding, metallurgy, organic chemistry) strictly from WBBSE Bhouto Bigyan o Paribesh.",
  life_science: "STRICT DOMAIN GUARDRAIL (LIFE SCIENCE \u2014 JIBAN BIGYAN O PARIBESH): Generate ONLY Biology, physiology, cytology, photosynthesis, respiration, circulation, nervous/endocrine control, cell division, heredity/genetics, evolution, and ecology questions strictly from WBBSE Jiban Bigyan o Paribesh.",
  history: "STRICT DOMAIN GUARDRAIL (HISTORY \u2014 ATIT O AITIHYYA / ITIHAS O PARIBESH): Generate ONLY historical questions (chronology, civilizations, dynasties, rulers, social/religious reforms, peasant/tribal movements, Indian freedom struggle) strictly from the prescribed WBBPE/WBBSE History syllabus.",
  geography: "STRICT DOMAIN GUARDRAIL (GEOGRAPHY \u2014 AMADER PRITHIBI / BHUGOL O PARIBESH): Generate ONLY geographical questions (exogenetic/endogenetic processes, atmosphere, hydrosphere, landforms, climate, soil, rivers, agriculture, industries, maps, West Bengal & India regional geography) strictly from the prescribed WBBPE/WBBSE Geography syllabus.",
  evs: "STRICT DOMAIN GUARDRAIL (ENVIRONMENTAL STUDIES \u2014 AMADER PARIBESH): Generate ONLY Environmental Studies questions covering human body systems, natural environment, biodiversity, landforms & rivers of West Bengal, natural resources, sky/space, and social heritage from WBBPE Amader Paribesh.",
  english: "STRICT DOMAIN GUARDRAIL (ENGLISH \u2014 BUTTERFLY / BLOSSOMS / BLISS & GRAMMAR): Generate ONLY English textbook comprehension questions (prose/poetry authors, characters, plot events, themes, and word meanings from the prescribed WBBPE/WBBSE textbook lesson) and WBBSE functional English grammar/vocabulary questions.",
  bangla: "STRICT DOMAIN GUARDRAIL (BANGLA \u2014 PATABAHAR / SAHITYA MELA / SAHITYA SANCHAYAN & BYAKARAN): Generate ONLY Bengali literature questions (authors, characters, themes, literary context from the prescribed textbook chapters) and Bengali grammar (Bhasha Path / Bangla Byakaran: Dhwani, Sandhi, Karaka, Samasa, Pratyaya, Bakya) questions.",
  hindi: "STRICT DOMAIN GUARDRAIL (HINDI \u2014 FIRST LANGUAGE & VYAKARAN): Generate ONLY Hindi grammar (Vyakaran: Varnamala, Sandhi, Samasa, Karak, Upsarg/Pratyay, Vakya, Alankar) and age-appropriate Hindi literature questions for this class level.",
  gk: "STRICT DOMAIN GUARDRAIL (GENERAL KNOWLEDGE): Generate ONLY curriculum-aligned General Knowledge questions appropriate for this class level."
};
var COGNITIVE_REASONING_ANGLES = [
  "Conceptual Mechanism & Cause-and-Effect Analysis",
  "Multi-Step Quantitative / Numerical Calculation with Fresh Values",
  "Real-World Practical Scenario & Applied Problem Solving",
  "Comparative Distinction & Identifying the Exception / Odd Property",
  "Critical Thinking & Resolving Common Student Misconceptions",
  "Deductive Inference from Experimental / Textual / Historical Evidence",
  "Reverse-Reasoning (Given the Outcome, Find the Underlying Input/Condition)",
  "Structural Classification & Principle Application"
];
function normalizeServerQuizMode(mode) {
  if (mode === "practice") return "practice";
  if (mode === "timed") return "timed";
  if (mode === "challenge") return "challenge";
  if (mode === "exam" || mode === "test") return "exam";
  return "timed";
}
var serverAttempts = /* @__PURE__ */ new Map();
var serverUserChats = /* @__PURE__ */ new Map();
function getUserChatMap(userId) {
  const cleanId = String(userId || "local_student").trim().slice(0, 128) || "local_student";
  let map = serverUserChats.get(cleanId);
  if (!map) {
    map = /* @__PURE__ */ new Map();
    serverUserChats.set(cleanId, map);
  }
  return map;
}
function getTokenSecretKey() {
  const secretSeed = getServerApiKey() || process.env.APP_URL || "iq-quiz-stateless-token-key-v1";
  return crypto.createHash("sha256").update(secretSeed).digest();
}
function encodeServerStateToken(attempt) {
  try {
    const key = getTokenSecretKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const plaintext = Buffer.from(JSON.stringify(attempt), "utf8");
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
  } catch {
    return "";
  }
}
function decodeServerStateToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length < 29) return null;
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);
    const key = getTokenSecretKey();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
    const parsed = JSON.parse(decrypted);
    if (parsed && typeof parsed.attemptId === "string" && Array.isArray(parsed.questions)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
function resolveServerAttempt(attemptId, serverStateToken, lockedAnswersSnapshot, markedForReviewSnapshot) {
  let attempt = serverAttempts.get(attemptId) || null;
  if (!attempt && serverStateToken) {
    const decoded = decodeServerStateToken(serverStateToken);
    if (decoded && decoded.attemptId === attemptId) {
      attempt = decoded;
      serverAttempts.set(attemptId, attempt);
    }
  }
  if (!attempt) return null;
  if (lockedAnswersSnapshot && typeof lockedAnswersSnapshot === "object") {
    for (const [qId, snapLock] of Object.entries(lockedAnswersSnapshot)) {
      if (!attempt.lockedAnswers[qId] && snapLock && typeof snapLock.selectedIndex === "number") {
        const q = attempt.questions.find((item) => item.id === qId);
        if (q) {
          attempt.lockedAnswers[qId] = {
            questionId: qId,
            selectedIndex: snapLock.selectedIndex,
            lockedAt: String(snapLock.lockedAt || (/* @__PURE__ */ new Date()).toISOString()),
            isCorrect: snapLock.selectedIndex === q.correctIndex
          };
        }
      }
    }
  }
  if (Array.isArray(markedForReviewSnapshot) && attempt.markedForReview.length === 0) {
    attempt.markedForReview = markedForReviewSnapshot.filter(
      (qId) => typeof qId === "string" && !attempt.lockedAnswers[qId]
    );
  }
  return attempt;
}
function sanitizeAttemptForClient(attempt) {
  const isCompleted = attempt.status === "completed";
  const normalizedMode = normalizeServerQuizMode(attempt.config.mode);
  const hidesAnswersUntilCompleted = normalizedMode === "exam";
  const clientQuestions = attempt.questions.map((q) => {
    const isQuestionLocked = Boolean(attempt.lockedAnswers[q.id]);
    const revealAnswer = isCompleted || !hidesAnswersUntilCompleted && isQuestionLocked;
    return {
      id: q.id,
      fingerprint: q.fingerprint,
      structuralHash: q.structuralHash,
      conceptKey: q.conceptKey,
      classLevel: q.classLevel,
      subject: q.subject,
      topic: q.topic,
      chapterId: q.chapterId,
      chapterNumber: q.chapterNumber,
      chapterTitle: q.chapterTitle,
      textbookName: q.textbookName,
      board: q.board,
      curriculumVerificationStatus: q.curriculumVerificationStatus,
      difficulty: q.difficulty,
      language: q.language,
      questionType: q.questionType,
      questionText: q.questionText,
      options: q.options,
      hint: q.hint,
      ...revealAnswer ? {
        correctIndex: q.correctIndex,
        explanation: q.explanation
      } : {}
    };
  });
  const clientLockedAnswers = {};
  for (const [qId, lock] of Object.entries(attempt.lockedAnswers)) {
    const q = attempt.questions.find((item) => item.id === qId);
    const revealAnswer = isCompleted || !hidesAnswersUntilCompleted;
    clientLockedAnswers[qId] = {
      questionId: lock.questionId,
      selectedIndex: lock.selectedIndex,
      lockedAt: lock.lockedAt,
      ...revealAnswer && q ? {
        isCorrect: lock.isCorrect,
        correctIndex: q.correctIndex,
        explanation: q.explanation
      } : {}
    };
  }
  return {
    attemptId: attempt.attemptId,
    parentAttemptId: attempt.parentAttemptId,
    userId: attempt.userId,
    config: attempt.config,
    questions: clientQuestions,
    lockedAnswers: clientLockedAnswers,
    markedForReview: attempt.markedForReview,
    status: attempt.status,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    timeTakenSeconds: attempt.timeTakenSeconds,
    scoreSummary: isCompleted ? attempt.scoreSummary : void 0,
    serverStateToken: encodeServerStateToken(attempt),
    generationInfo: attempt.generationInfo
  };
}
function computeScoreSummary(attempt, timeTakenSeconds) {
  const totalQuestions = attempt.questions.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  const topicMap = /* @__PURE__ */ new Map();
  for (const q of attempt.questions) {
    const tKey = q.topic || "General";
    if (!topicMap.has(tKey)) {
      topicMap.set(tKey, { topic: tKey, total: 0, correct: 0, incorrect: 0, unanswered: 0 });
    }
    const tEntry = topicMap.get(tKey);
    tEntry.total += 1;
    const lock = attempt.lockedAnswers[q.id];
    if (!lock) {
      unansweredCount += 1;
      tEntry.unanswered += 1;
    } else if (lock.isCorrect) {
      correctCount += 1;
      tEntry.correct += 1;
    } else {
      incorrectCount += 1;
      tEntry.incorrect += 1;
    }
  }
  const topicBreakdown = Array.from(topicMap.values()).map((item) => ({
    ...item,
    accuracy: item.total > 0 ? Math.round(item.correct / item.total * 100) : 0
  }));
  const percentage = totalQuestions > 0 ? Math.round(correctCount / totalQuestions * 100) : 0;
  return {
    totalQuestions,
    correctCount,
    incorrectCount,
    unansweredCount,
    score: correctCount,
    maxScore: totalQuestions,
    percentage,
    timeTakenSeconds,
    topicBreakdown
  };
}
function validateAndNormalizeQuestion(raw, config2, index) {
  if (!raw || typeof raw.questionText !== "string" || raw.questionText.trim().length < 5) {
    return null;
  }
  const qType = raw.questionType === "tf" ? "tf" : "mcq";
  let options = Array.isArray(raw.options) ? raw.options.map((o) => String(o || "").trim()).filter((o) => o.length > 0) : [];
  if (qType === "tf") {
    const tfLabels = {
      en: ["True", "False"],
      bn: ["\u09B8\u09A4\u09CD\u09AF (True)", "\u09AE\u09BF\u09A5\u09CD\u09AF\u09BE (False)"],
      hi: ["\u0938\u0924\u094D\u092F (True)", "\u0905\u0938\u0924\u094D\u092F (False)"]
    };
    options = tfLabels[config2.quizLanguage] || tfLabels.en;
  } else {
    const uniqueOpts = Array.from(new Set(options));
    if (uniqueOpts.length < 4) {
      return null;
    }
    options = uniqueOpts.slice(0, 4);
  }
  let correctIndex = Number(raw.correctIndex);
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
    return null;
  }
  if (qType === "mcq" && options.length === 4) {
    const correctOptionText = options[correctIndex];
    const hashByte = crypto.createHash("md5").update(`${raw.questionText}_${index}_${Date.now()}`).digest()[0];
    const shift = hashByte % 4;
    if (shift > 0) {
      const rotated = [
        options[(0 + shift) % 4],
        options[(1 + shift) % 4],
        options[(2 + shift) % 4],
        options[(3 + shift) % 4]
      ];
      const newIdx = rotated.indexOf(correctOptionText);
      if (newIdx !== -1) {
        options = rotated;
        correctIndex = newIdx;
      }
    }
  }
  const explanation = typeof raw.explanation === "string" && raw.explanation.trim().length > 5 ? raw.explanation.trim() : config2.quizLanguage === "bn" ? `\u09B8\u09A0\u09BF\u0995 \u0989\u09A4\u09CD\u09A4\u09B0 \u09B9\u09B2\u09CB "${options[correctIndex]}" \u0995\u09BE\u09B0\u09A3 \u098F\u099F\u09BF \u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997 \u09AC\u09CB\u09B0\u09CD\u09A1\u09C7\u09B0 \u09AA\u09BE\u09A0\u09CD\u09AF\u0995\u09CD\u09B0\u09AE\u09C7\u09B0 \u09A4\u09A5\u09CD\u09AF\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09B8\u09BE\u09AE\u099E\u09CD\u099C\u09B8\u09CD\u09AF\u09AA\u09C2\u09B0\u09CD\u09A3\u0964` : config2.quizLanguage === "hi" ? `\u0938\u0939\u0940 \u0909\u0924\u094D\u0924\u0930 "${options[correctIndex]}" \u0939\u0948 \u0915\u094D\u092F\u094B\u0902\u0915\u093F \u092F\u0939 \u092A\u0936\u094D\u091A\u093F\u092E \u092C\u0902\u0917\u093E\u0932 \u092C\u094B\u0930\u094D\u0921 \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0915\u0947 \u0938\u093F\u0926\u094D\u0927\u093E\u0902\u0924 \u0915\u0947 \u0905\u0928\u0941\u0930\u0942\u092A \u0939\u0948\u0964` : `The correct answer is "${options[correctIndex]}" based on verified WBBSE/WBBPE curriculum principles.`;
  const cleanText = raw.questionText.trim();
  const fp = computeFingerprint(cleanText);
  const sHash = computeStructuralHash(cleanText);
  const conceptKey = typeof raw.conceptKey === "string" && raw.conceptKey.trim().length > 2 ? raw.conceptKey.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 80) : `${config2.subject}_c${config2.classLevel}_${fp.slice(0, 10)}`;
  const diff = raw.difficulty === "easy" || raw.difficulty === "medium" || raw.difficulty === "hard" ? raw.difficulty : config2.difficulty === "easy" || config2.difficulty === "medium" || config2.difficulty === "hard" ? config2.difficulty : index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard";
  let matchedChapter = config2.fallbackChapter;
  if (Array.isArray(config2.allSubjectChapters) && config2.allSubjectChapters.length > 0) {
    const rawChapterId = typeof raw.chapterId === "string" ? raw.chapterId.trim() : "";
    const rawTopicStr = typeof raw.topic === "string" ? raw.topic.trim().toLowerCase() : "";
    if (rawChapterId) {
      const byId = config2.allSubjectChapters.find((c) => c.id === rawChapterId);
      if (byId) matchedChapter = byId;
    }
    if (!matchedChapter && rawTopicStr) {
      const byTitle = config2.allSubjectChapters.find(
        (c) => rawTopicStr.includes(c.title.en.toLowerCase()) || rawTopicStr.includes(c.title.bn.toLowerCase()) || rawTopicStr.includes(c.title.hi.toLowerCase()) || c.title.en.toLowerCase().includes(rawTopicStr)
      );
      if (byTitle) matchedChapter = byTitle;
    }
    if (!matchedChapter) {
      matchedChapter = config2.allSubjectChapters[index % config2.allSubjectChapters.length];
    }
  }
  const resolvedChapterTitle = matchedChapter ? matchedChapter.title[config2.quizLanguage] || matchedChapter.title.en : void 0;
  const resolvedTopic = typeof raw.topic === "string" && raw.topic.trim().length > 2 && raw.topic.trim() !== "All Verified Chapters" ? raw.topic.trim() : resolvedChapterTitle || config2.topic || "Core Curriculum";
  return {
    id: `q_${config2.classLevel}_${config2.subject}_${fp}_${index}`,
    fingerprint: fp,
    structuralHash: sHash,
    conceptKey,
    classLevel: config2.classLevel,
    subject: config2.subject,
    topic: resolvedTopic,
    chapterId: matchedChapter?.id,
    chapterNumber: matchedChapter?.chapterNumber,
    chapterTitle: resolvedChapterTitle,
    textbookName: config2.textbookName,
    board: config2.board || (config2.classLevel === 5 ? "WBBPE" : "WBBSE"),
    curriculumVerificationStatus: config2.curriculumVerificationStatus || "verified",
    difficulty: diff,
    language: config2.quizLanguage,
    questionType: qType,
    questionText: cleanText,
    options,
    correctIndex,
    explanation,
    hint: typeof raw.hint === "string" && raw.hint.trim().length > 2 ? raw.hint.trim() : void 0
  };
}
async function generateFreshVerifiedQuizQuestions(params) {
  const {
    ai,
    classLevel,
    subject,
    quizLanguage,
    topic,
    difficulty,
    questionCount,
    questionType,
    existingHistory,
    excludedFingerprints
  } = params;
  const langName = quizLanguage === "bn" ? "Bengali (\u09AC\u09BE\u0982\u09B2\u09BE)" : quizLanguage === "hi" ? "Hindi (\u0939\u093F\u0928\u094D\u0926\u0940)" : "English";
  const curriculumResolution = resolveCurriculumChaptersForQuiz(
    classLevel,
    subject,
    topic
  );
  const curriculumCtx = curriculumResolution.curriculum;
  const isSingleChapter = !curriculumResolution.isAllChapters;
  const boardName = classLevel === 5 ? "WBBPE" : "WBBSE";
  const subjectDef = getSubjectDefinition(subject);
  const subjectDisplayName = subjectDef ? `${subjectDef.name.en} (${subjectDef.name[quizLanguage]})` : subject;
  const localizedTextbookName = curriculumCtx.textbookName[quizLanguage] || curriculumCtx.textbookName.en;
  const domainGuardrail = SUBJECT_DOMAIN_GUARDRAILS[subject] || SUBJECT_DOMAIN_GUARDRAILS.gk;
  const comparisonPool = [...existingHistory];
  const workingFingerprints = new Set(excludedFingerprints);
  for (const h of existingHistory) {
    if (h.fingerprint) workingFingerprints.add(h.fingerprint);
  }
  const acceptedQuestions = [];
  const rejectedStemsThisRun = [];
  let resolvedModelName = ACTIVE_GEMINI_MODEL;
  let rejectedDuplicatesCount = 0;
  const randomSeedNumber = crypto.randomBytes(4).readUInt32BE(0);
  const activeChapters = curriculumResolution.selectedChapters;
  const rotatedChapters = activeChapters.length > 1 ? activeChapters.map((chItem, idx) => ({
    chItem,
    score: (idx * 37 + randomSeedNumber) % 997
  })).sort((a, b) => a.score - b.score).map((x) => x.chItem) : activeChapters;
  const fallbackSubtopicPool = SUBJECT_SUBTOPIC_POOL[subject] || SUBJECT_SUBTOPIC_POOL.gk;
  for (let pass = 1; pass <= MAX_GENERATION_PASSES; pass++) {
    const remainingNeeded = questionCount - acceptedQuestions.length;
    if (remainingNeeded <= 0) break;
    const batchRequestCount = pass === 1 ? Math.min(remainingNeeded + 2, 54) : Math.min(remainingNeeded + 3, 20);
    const recentConceptKeys = Array.from(
      new Set(
        comparisonPool.map((h) => h.conceptKey).filter((k) => typeof k === "string" && k.length > 2)
      )
    ).slice(-45);
    const recentQuestionStems = comparisonPool.map((h) => (h.questionText || "").replace(/\s+/g, " ").trim()).filter((s) => s.length > 5).slice(-28).map((s, idx) => `${idx + 1}. "${s.slice(0, 105)}"`);
    const slotAssignments = [];
    const slotChapters = [];
    for (let s = 0; s < batchRequestCount; s++) {
      const angleChoice = COGNITIVE_REASONING_ANGLES[(randomSeedNumber + s + pass * 3) % COGNITIVE_REASONING_ANGLES.length];
      if (rotatedChapters.length > 0) {
        const assignedChapter = isSingleChapter ? rotatedChapters[0] : rotatedChapters[(s + (pass - 1) * 3) % rotatedChapters.length];
        slotChapters.push(assignedChapter);
        const concepts = assignedChapter.keyConcepts || [];
        const conceptFocus = concepts.length > 0 ? concepts[(s + (pass - 1) * 2) % concepts.length] : assignedChapter.title.en;
        slotAssignments.push(
          `- Question ${s + 1}: ChapterId="${assignedChapter.id}" | Chapter="Ch ${assignedChapter.chapterNumber}: ${assignedChapter.title.en} (${assignedChapter.title[quizLanguage]})" | Syllabus Topic Focus="[${conceptFocus}]" | Reasoning Angle="[${angleChoice}]"`
        );
      } else {
        slotChapters.push(void 0);
        const subtopicChoice = fallbackSubtopicPool[(s + (pass - 1) * 5) % fallbackSubtopicPool.length];
        slotAssignments.push(
          `- Question ${s + 1}: Subtopic Focus="[${subtopicChoice}]" | Reasoning Angle="[${angleChoice}]"`
        );
      }
    }
    const systemInstruction = `You are a senior West Bengal Board (${boardName}) academic curriculum examiner for Class ${classLevel}.
${domainGuardrail}

OFFICIAL CURRICULUM & TEXTBOOK CONTEXT:
- Board: ${boardName} (${boardName === "WBBPE" ? "West Bengal Board of Primary Education" : "West Bengal Board of Secondary Education"})
- Class: Class ${classLevel}
- Academic Subject: ${subjectDisplayName} (subject id: "${subject}")
- Prescribed Textbook: ${curriculumCtx.textbookName.en} / ${curriculumCtx.textbookName.bn}
- Syllabus Version: ${curriculumCtx.syllabusVersion} (${curriculumCtx.verificationStatus})

CRITICAL GENERATION RULES:
1. Subject & Chapter Fidelity: Every question MUST strictly test the assigned WBBPE/WBBSE chapter and syllabus topic for "${subjectDisplayName}" in Class ${classLevel}. Never mix subjects (e.g., Mathematics must stay strictly mathematical, History strictly historical, Geography strictly geographical, Physical Science strictly Physics/Chemistry, Life Science strictly Biology).
2. Presentation Language Independence: Write the questionText, options, hint, and explanation strictly in "${langName}" (language code: "${quizLanguage}"), even when the subject is English, Bangla, or Hindi.
3. Factual & Mathematical Precision: Every question must be 100% factually, scientifically, and mathematically accurate according to the Class ${classLevel} WBBPE/WBBSE textbook. Double-check all calculations so the option at correctIndex is indisputably right.
4. ZERO DUPLICATES & HIGH DIVERSITY: Never repeat or paraphrase any previously asked question stem or concept key listed in the prompt.
5. Keep each explanation concise (1-2 clear sentences referencing the textbook concept) and each hint brief (1 short sentence).
6. For questionType "${questionType}": if "mcq", provide 4 distinct, plausible options and correctIndex (0-3). If "tf", provide 2 options (True/False in ${langName}) and correctIndex (0 or 1). If "mixed", include a mix of "mcq" and "tf" questions.`;
    const exclusionSection = recentConceptKeys.length > 0 || recentQuestionStems.length > 0 || rejectedStemsThisRun.length > 0 ? `
STRICT EXCLUSION LIST (DO NOT REPEAT OR PARAPHRASE ANY OF THESE):
- Previously Tested Concept Keys to Avoid: [${recentConceptKeys.join(", ") || "none"}]
${recentQuestionStems.length > 0 ? `- Previously Asked Question Stems for this User (Forbidden to repeat or reword):
${recentQuestionStems.join("\n")}` : ""}
${rejectedStemsThisRun.length > 0 ? `- Duplicate Stems Rejected in Earlier Pass (MUST NOT reuse these concepts or structures):
${rejectedStemsThisRun.slice(-10).map((r) => `  * "${r}"`).join("\n")}` : ""}
` : "";
    const chunkLimit = questionCount >= 30 ? 10 : MAX_QUESTIONS_PER_CHUNK;
    const chunkDescriptors = [];
    for (let offset = 0, cIdx = 0; offset < batchRequestCount; offset += chunkLimit, cIdx++) {
      const sliceSlots = slotAssignments.slice(offset, offset + chunkLimit);
      const sliceChapters = slotChapters.slice(offset, offset + chunkLimit);
      chunkDescriptors.push({
        count: sliceSlots.length,
        slots: sliceSlots,
        chapters: sliceChapters,
        chunkIndex: cIdx
      });
    }
    const questionItemSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionText: {
            type: Type.STRING,
            description: `Full question text written in ${langName}`
          },
          questionType: {
            type: Type.STRING,
            description: 'Either "mcq" or "tf"'
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "4 distinct options for mcq, or 2 options for tf"
          },
          correctIndex: {
            type: Type.INTEGER,
            description: "0-based index of the single correct option"
          },
          explanation: {
            type: Type.STRING,
            description: `Concise 1-2 sentence explanation of why the correct option is right, in ${langName}`
          },
          hint: {
            type: Type.STRING,
            description: `Short 1-sentence helpful hint without giving away the answer, in ${langName}`
          },
          chapterId: {
            type: Type.STRING,
            description: "Exact ChapterId assigned to this question slot"
          },
          topic: {
            type: Type.STRING,
            description: `Chapter title or specific syllabus topic in ${langName}`
          },
          difficulty: {
            type: Type.STRING,
            description: "easy, medium, or hard"
          },
          conceptKey: {
            type: Type.STRING,
            description: "Specific snake_case identifier of the exact academic concept & scenario tested"
          }
        },
        required: [
          "questionText",
          "questionType",
          "options",
          "correctIndex",
          "explanation",
          "topic",
          "difficulty",
          "conceptKey"
        ]
      }
    };
    const chunkResults = await Promise.allSettled(
      chunkDescriptors.map(async (chunk) => {
        const chunkPrompt = `${pass > 1 ? `[REPLACEMENT GENERATION PASS #${pass}]: Generate ${chunk.count} BRAND-NEW, completely different replacement questions.
` : ""}Generate exactly ${chunk.count} unique, fresh WBBPE/WBBSE curriculum quiz questions for:
- Board & Class: ${boardName} Class ${classLevel}
- Academic Subject: ${subjectDisplayName}
- Prescribed Textbook: ${localizedTextbookName}
- Selected Chapter / Scope: ${isSingleChapter && activeChapters[0] ? `Chapter ${activeChapters[0].chapterNumber}: ${activeChapters[0].title.en} (${activeChapters[0].title[quizLanguage]})` : `All Verified Chapters (${activeChapters.length} chapters in textbook)`}
- Difficulty Level: ${difficulty}
- Question Type: ${questionType}
- Presentation Language: ${langName} (language code: ${quizLanguage})
- Cryptographic Entropy Seed: ${Date.now()}_${randomSeedNumber}_pass${pass}_chunk${chunk.chunkIndex}

REQUIRED CHAPTER, TOPIC & REASONING SLOT PLAN FOR THIS BATCH:
${chunk.slots.join("\n")}
${exclusionSection}`;
        const res = await generateContentWithModelFallback(ai, {
          contents: chunkPrompt,
          config: {
            systemInstruction,
            temperature: pass === 1 ? 0.85 : 0.92,
            responseMimeType: "application/json",
            responseSchema: questionItemSchema
          }
        });
        return { ...res, slotChapters: chunk.chapters };
      })
    );
    const candidateArray = [];
    let lastChunkError = null;
    for (const resItem of chunkResults) {
      if (resItem.status === "fulfilled") {
        resolvedModelName = resItem.value.modelUsed;
        const parsed = parseGeminiJsonSafe(resItem.value.response?.text);
        const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.questions) ? parsed.questions : Array.isArray(parsed?.items) ? parsed.items : [];
        items.forEach((rawItem, idx) => {
          candidateArray.push({
            rawItem,
            assignedChapter: resItem.value.slotChapters[idx]
          });
        });
      } else {
        lastChunkError = resItem.reason;
      }
    }
    if (candidateArray.length === 0 && lastChunkError && acceptedQuestions.length === 0) {
      throw lastChunkError;
    }
    for (const { rawItem, assignedChapter } of candidateArray) {
      if (acceptedQuestions.length >= questionCount) break;
      const normalized = validateAndNormalizeQuestion(
        rawItem,
        {
          classLevel,
          subject,
          quizLanguage,
          topic,
          difficulty,
          board: boardName,
          textbookName: localizedTextbookName,
          curriculumVerificationStatus: curriculumCtx.verificationStatus,
          fallbackChapter: assignedChapter,
          allSubjectChapters: activeChapters
        },
        acceptedQuestions.length
      );
      if (!normalized) continue;
      const simCheck = isQuestionDuplicateOrSimilar(
        normalized,
        comparisonPool,
        workingFingerprints
      );
      if (simCheck.duplicate) {
        rejectedDuplicatesCount++;
        rejectedStemsThisRun.push(
          `${normalized.questionText.slice(0, 90)} [reason: ${simCheck.reason}]`
        );
        if (pass === MAX_GENERATION_PASSES && !workingFingerprints.has(normalized.fingerprint) && simCheck.reason !== "exact_fingerprint" && simCheck.reason !== "exact_fingerprint_match") {
          workingFingerprints.add(normalized.fingerprint);
          comparisonPool.push({
            fingerprint: normalized.fingerprint,
            structuralHash: normalized.structuralHash,
            conceptKey: normalized.conceptKey,
            questionText: normalized.questionText,
            options: normalized.options,
            classLevel: normalized.classLevel,
            subject: normalized.subject,
            topic: normalized.topic,
            difficulty: normalized.difficulty
          });
          acceptedQuestions.push(normalized);
        }
        continue;
      }
      workingFingerprints.add(normalized.fingerprint);
      comparisonPool.push({
        fingerprint: normalized.fingerprint,
        structuralHash: normalized.structuralHash,
        conceptKey: normalized.conceptKey,
        questionText: normalized.questionText,
        options: normalized.options,
        classLevel: normalized.classLevel,
        subject: normalized.subject,
        topic: normalized.topic,
        difficulty: normalized.difficulty
      });
      acceptedQuestions.push(normalized);
    }
    if (acceptedQuestions.length >= questionCount) {
      break;
    }
  }
  return {
    questions: acceptedQuestions,
    modelUsed: resolvedModelName,
    rejectedDuplicatesCount,
    curriculumMeta: {
      board: boardName,
      textbookName: localizedTextbookName,
      syllabusCode: curriculumCtx.syllabusVersion,
      verificationStatus: curriculumCtx.verificationStatus,
      chapterId: isSingleChapter && activeChapters[0] ? activeChapters[0].id : void 0
    }
  };
}
async function handler(req, res) {
  try {
    const method = String(req.method || "GET").toUpperCase();
    const routePath = resolveRoutePath(req);
    if (method === "OPTIONS") {
      res.statusCode = 204;
      if (typeof res.end === "function") res.end();
      return;
    }
    if (method === "GET" && routePath === "/api/ai/status") {
      const hasKey = Boolean(getServerApiKey());
      sendJson(res, 200, {
        status: hasKey ? "ready" : "missing_api_key",
        apiKeyConfigured: hasKey,
        requiredEnvVar: "GEMINI_API_KEY",
        model: ACTIVE_GEMINI_MODEL,
        supportedModels: SUPPORTED_GEMINI_MODELS,
        freeTierEligible: true
      });
      return;
    }
    if (method === "GET" && routePath === "/api/curriculum") {
      const summary = CLASS_LEVELS.map((cls) => {
        const subjects = getSubjectsForClass(cls);
        const board = cls === 5 ? "WBBPE" : "WBBSE";
        return {
          classLevel: cls,
          board,
          subjects: subjects.map((sub) => {
            const curr = getClassCurriculum(cls, sub.id);
            return {
              subjectId: sub.id,
              name: sub.name,
              board,
              textbookName: curr.textbookName,
              syllabusVersion: curr.syllabusVersion,
              verificationStatus: curr.verificationStatus,
              officialSource: curr.officialSource,
              chapterCount: curr.chapters.length,
              chapters: curr.chapters.map((ch2) => ({
                id: ch2.id,
                chapterNumber: ch2.chapterNumber,
                title: ch2.title,
                topicsCount: ch2.keyConcepts.length,
                topics: ch2.keyConcepts
              }))
            };
          })
        };
      });
      sendJson(res, 200, {
        curriculumBoard: "WBBPE (Class 5) & WBBSE (Classes 6\u201310)",
        classes: summary
      });
      return;
    }
    if (method === "POST" && routePath === "/api/quiz/generate") {
      const body = await readJsonBody(req);
      const {
        classLevel = 8,
        subject = "mathematics",
        quizLanguage = "en",
        topic = "All Verified Chapters",
        difficulty = "mixed",
        questionCount = 5,
        questionType = "mcq",
        durationMinutes = 10,
        mode = "practice",
        userId = "local_student",
        clientExcludedFingerprints = [],
        clientExcludedHistory = []
      } = body || {};
      const ai = getAiClient();
      if (!ai) {
        logServerError(
          "Missing GEMINI_API_KEY in /api/quiz/generate",
          new Error("GEMINI_API_KEY is not configured in server environment variables.")
        );
        sendJson(res, 503, {
          error: "Gemini AI API key is not configured on the server. Please add GEMINI_API_KEY in your Environment Variables and redeploy."
        });
        return;
      }
      const numClass = Number(classLevel);
      if (![5, 6, 7, 8, 9, 10].includes(numClass)) {
        sendJson(res, 400, {
          error: `Invalid class level (${classLevel}). Supported classes are 5, 6, 7, 8, 9, and 10.`
        });
        return;
      }
      const validClass = numClass;
      const classSubjects = getSubjectsForClass(validClass);
      const isSubjectValid = classSubjects.some((s) => s.id === subject);
      if (!isSubjectValid) {
        sendJson(res, 400, {
          error: `Subject "${subject}" is not applicable for Class ${validClass}. Please select a valid subject for this class.`
        });
        return;
      }
      if (quizLanguage !== "en" && quizLanguage !== "bn" && quizLanguage !== "hi") {
        sendJson(res, 400, {
          error: `Invalid quiz language "${quizLanguage}". Supported languages are English (en), Bengali (bn), and Hindi (hi).`
        });
        return;
      }
      const validQuizLang = quizLanguage;
      const numCount = Number(questionCount);
      if (![5, 10, 15, 20, 30, 50].includes(numCount)) {
        sendJson(res, 400, {
          error: `Invalid question count (${questionCount}). Supported counts are 5, 10, 15, 20, 30, or 50.`
        });
        return;
      }
      const validCount = numCount;
      const cleanUserId = String(userId || "local_student");
      const serverHist = getUserServerHistory(cleanUserId);
      const mergedHistoryMap = /* @__PURE__ */ new Map();
      for (const item of serverHist) {
        if (item && item.fingerprint && (!item.classLevel || item.classLevel === validClass) && (!item.subject || item.subject === subject)) {
          mergedHistoryMap.set(item.fingerprint, item);
        }
      }
      if (Array.isArray(clientExcludedHistory)) {
        for (const item of clientExcludedHistory) {
          if (item && typeof item.questionText === "string" && item.questionText.trim()) {
            const fp = typeof item.fingerprint === "string" && item.fingerprint.trim() ? item.fingerprint.trim() : computeFingerprint(item.questionText);
            const sHash = typeof item.structuralHash === "string" && item.structuralHash.trim() ? item.structuralHash.trim() : computeStructuralHash(item.questionText);
            mergedHistoryMap.set(fp, {
              fingerprint: fp,
              structuralHash: sHash,
              conceptKey: String(item.conceptKey || ""),
              questionText: item.questionText.trim(),
              options: Array.isArray(item.options) ? item.options.map(String) : void 0,
              classLevel: Number(item.classLevel) || validClass,
              subject: String(item.subject || subject),
              topic: String(item.topic || topic),
              difficulty: String(item.difficulty || difficulty)
            });
          }
        }
      }
      const excludedFingerprintsSet = /* @__PURE__ */ new Set();
      for (const item of serverHist) {
        if (item.fingerprint) excludedFingerprintsSet.add(item.fingerprint);
      }
      if (Array.isArray(clientExcludedFingerprints)) {
        for (const fp of clientExcludedFingerprints) {
          if (typeof fp === "string" && fp.trim()) {
            excludedFingerprintsSet.add(fp.trim());
          }
        }
      }
      const relevantHistory = Array.from(mergedHistoryMap.values());
      try {
        const normalizedMode = normalizeServerQuizMode(mode);
        const resolvedDifficulty = normalizedMode === "challenge" ? "hard" : String(difficulty || "mixed");
        const { questions, modelUsed, rejectedDuplicatesCount, curriculumMeta } = await generateFreshVerifiedQuizQuestions({
          ai,
          classLevel: validClass,
          subject: String(subject),
          quizLanguage: validQuizLang,
          topic: String(topic),
          difficulty: resolvedDifficulty,
          questionCount: validCount,
          questionType: String(questionType),
          existingHistory: relevantHistory,
          excludedFingerprints: excludedFingerprintsSet
        });
        if (questions.length === 0) {
          sendJson(res, 502, {
            error: "Gemini AI returned an empty or invalid question set. Please click Retry to generate a fresh quiz."
          });
          return;
        }
        recordQuestionsInServerHistory(cleanUserId, questions);
        const timerMap = { 5: 3, 10: 7, 15: 10, 20: 15, 30: 25, 50: 45 };
        const resolvedDuration = normalizedMode === "practice" ? 0 : timerMap[questions.length] ?? timerMap[validCount] ?? (Number(durationMinutes) || 3);
        const attemptId = `att_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        const attempt = {
          attemptId,
          userId: cleanUserId,
          config: {
            classLevel: validClass,
            subject: String(subject),
            quizLanguage: validQuizLang,
            topic: String(topic),
            chapterId: curriculumMeta.chapterId,
            textbookName: curriculumMeta.textbookName,
            board: curriculumMeta.board,
            curriculumVerificationStatus: curriculumMeta.verificationStatus,
            difficulty: resolvedDifficulty,
            questionCount: questions.length,
            questionType: String(questionType),
            durationMinutes: resolvedDuration,
            mode: normalizedMode
          },
          questions,
          lockedAnswers: {},
          markedForReview: [],
          status: "in_progress",
          startedAt: (/* @__PURE__ */ new Date()).toISOString(),
          timeTakenSeconds: 0,
          generationInfo: {
            model: modelUsed,
            source: "gemini-ai",
            board: curriculumMeta.board,
            textbookName: curriculumMeta.textbookName,
            syllabusCode: curriculumMeta.syllabusCode,
            verificationStatus: curriculumMeta.verificationStatus,
            excludedHistoryCount: excludedFingerprintsSet.size,
            uniqueConceptsCount: questions.length,
            notice: rejectedDuplicatesCount > 0 ? `Filtered ${rejectedDuplicatesCount} similar question(s) and generated fresh Gemini AI replacements.` : void 0
          }
        };
        serverAttempts.set(attemptId, attempt);
        console.info(
          `[IQ Quiz Server] Fresh WBBSE quiz generated | attemptId=${attemptId} | model=${modelUsed} | board=${curriculumMeta.board} | class=${validClass} | subject=${subject} | textbook="${curriculumMeta.textbookName}" | lang=${validQuizLang} | excludedHistory=${excludedFingerprintsSet.size} | rejectedSimilar=${rejectedDuplicatesCount}`
        );
        sendJson(res, 200, sanitizeAttemptForClient(attempt));
        return;
      } catch (aiErr) {
        const status = aiErr?.status || aiErr?.statusCode || 503;
        logServerError("Gemini quiz generation failed in /api/quiz/generate", aiErr, {
          classLevel: validClass,
          subject,
          quizLanguage: validQuizLang,
          status
        });
        const msg = String(aiErr?.message || aiErr || "").toLowerCase();
        if (status === 401 || status === 403 || msg.includes("api_key_invalid") || msg.includes("api key not valid") || msg.includes("invalid api key") || msg.includes("permission_denied")) {
          sendJson(res, 401, {
            error: "The configured GEMINI_API_KEY on the server was rejected or unauthorized by Google Gemini API. Please verify your GEMINI_API_KEY in Vercel Project Settings \u2192 Environment Variables and redeploy."
          });
          return;
        }
        if (status === 429 || msg.includes("429") || msg.includes("resource_exhausted") || msg.includes("quota")) {
          sendJson(res, 429, {
            error: "Gemini AI rate limit or quota exceeded. Please wait a few seconds and click Retry Quiz Generation."
          });
          return;
        }
        if (status === 503 || msg.includes("503") || msg.includes("high demand") || msg.includes("unavailable")) {
          sendJson(res, 503, {
            error: "Gemini AI is currently experiencing high temporary demand (HTTP 503). Please click Retry Quiz Generation to try again."
          });
          return;
        }
        if (status === 504 || msg.includes("timed out") || msg.includes("timeout")) {
          sendJson(res, 504, {
            error: "Gemini AI request timed out. Please click Retry Quiz Generation to try again."
          });
          return;
        }
        const detailedMessage = aiErr?.message ? `Gemini API error: ${aiErr.message}` : "Unable to reach Gemini AI right now to generate fresh questions. Please click Retry Quiz Generation.";
        sendJson(res, status >= 400 && status < 600 ? status : 503, {
          error: detailedMessage
        });
        return;
      }
    }
    if (method === "POST" && routePath === "/api/quiz/lock-answer") {
      const body = await readJsonBody(req);
      const {
        attemptId,
        questionId,
        selectedIndex,
        timeTakenSeconds,
        serverStateToken,
        lockedAnswersSnapshot
      } = body || {};
      if (!attemptId || !questionId || typeof selectedIndex !== "number") {
        sendJson(res, 400, { error: "Missing attemptId, questionId, or selectedIndex." });
        return;
      }
      const attempt = resolveServerAttempt(attemptId, serverStateToken, lockedAnswersSnapshot);
      if (!attempt) {
        sendJson(res, 404, { error: "Quiz attempt not found on server." });
        return;
      }
      if (attempt.status === "completed") {
        sendJson(res, 409, {
          error: "This quiz attempt has already been submitted and finalized. Answers cannot be altered.",
          attempt: sanitizeAttemptForClient(attempt)
        });
        return;
      }
      if (attempt.lockedAnswers[questionId]) {
        sendJson(res, 409, {
          error: "Answer is permanently locked for this attempt and cannot be changed.",
          lockedRecord: attempt.lockedAnswers[questionId],
          attempt: sanitizeAttemptForClient(attempt)
        });
        return;
      }
      const question = attempt.questions.find((q) => q.id === questionId);
      if (!question) {
        sendJson(res, 404, { error: "Question not found in this attempt." });
        return;
      }
      if (selectedIndex < 0 || selectedIndex >= question.options.length) {
        sendJson(res, 400, { error: "Invalid option index." });
        return;
      }
      const isCorrect = selectedIndex === question.correctIndex;
      const lockedRecord = {
        questionId,
        selectedIndex,
        lockedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isCorrect
      };
      attempt.lockedAnswers[questionId] = lockedRecord;
      attempt.markedForReview = attempt.markedForReview.filter((id) => id !== questionId);
      if (typeof timeTakenSeconds === "number" && timeTakenSeconds >= 0) {
        attempt.timeTakenSeconds = Math.max(attempt.timeTakenSeconds, Math.round(timeTakenSeconds));
      }
      sendJson(res, 200, {
        locked: true,
        attempt: sanitizeAttemptForClient(attempt)
      });
      return;
    }
    if (method === "POST" && routePath === "/api/quiz/toggle-review") {
      const body = await readJsonBody(req);
      const {
        attemptId,
        questionId,
        serverStateToken,
        lockedAnswersSnapshot,
        markedForReviewSnapshot
      } = body || {};
      const attempt = resolveServerAttempt(
        attemptId,
        serverStateToken,
        lockedAnswersSnapshot,
        markedForReviewSnapshot
      );
      if (!attempt) {
        sendJson(res, 404, { error: "Attempt not found." });
        return;
      }
      if (attempt.status === "completed" || attempt.lockedAnswers[questionId]) {
        sendJson(res, 409, {
          error: "Locked questions cannot be modified.",
          attempt: sanitizeAttemptForClient(attempt)
        });
        return;
      }
      if (attempt.markedForReview.includes(questionId)) {
        attempt.markedForReview = attempt.markedForReview.filter((id) => id !== questionId);
      } else {
        attempt.markedForReview.push(questionId);
      }
      sendJson(res, 200, { attempt: sanitizeAttemptForClient(attempt) });
      return;
    }
    if (method === "POST" && routePath === "/api/quiz/submit") {
      const body = await readJsonBody(req);
      const {
        attemptId,
        timeTakenSeconds = 0,
        serverStateToken,
        lockedAnswersSnapshot
      } = body || {};
      const attempt = resolveServerAttempt(attemptId, serverStateToken, lockedAnswersSnapshot);
      if (!attempt) {
        sendJson(res, 404, { error: "Quiz attempt not found on server." });
        return;
      }
      if (attempt.status !== "completed") {
        attempt.status = "completed";
        attempt.completedAt = (/* @__PURE__ */ new Date()).toISOString();
        attempt.timeTakenSeconds = Math.max(
          attempt.timeTakenSeconds,
          Math.round(Number(timeTakenSeconds) || 0)
        );
        attempt.scoreSummary = computeScoreSummary(attempt, attempt.timeTakenSeconds);
      }
      sendJson(res, 200, sanitizeAttemptForClient(attempt));
      return;
    }
    if (method === "GET" && routePath.startsWith("/api/quiz/attempt/")) {
      const attemptId = routePath.replace("/api/quiz/attempt/", "").trim();
      const attempt = serverAttempts.get(attemptId);
      if (!attempt) {
        sendJson(res, 404, { error: "Attempt not found." });
        return;
      }
      sendJson(res, 200, sanitizeAttemptForClient(attempt));
      return;
    }
    if (method === "POST" && routePath === "/api/quiz/retake") {
      const body = await readJsonBody(req);
      const {
        originalAttemptId,
        originalConfig,
        originalQuestions = [],
        serverStateToken,
        quizLanguage,
        userId = "local_student",
        clientExcludedFingerprints = [],
        clientExcludedHistory = []
      } = body || {};
      const ai = getAiClient();
      if (!ai) {
        logServerError(
          "Missing GEMINI_API_KEY in /api/quiz/retake",
          new Error("GEMINI_API_KEY is not configured in server environment variables.")
        );
        sendJson(res, 503, {
          error: "Gemini AI API key is not configured on the server. Please add GEMINI_API_KEY in your Environment Variables and redeploy."
        });
        return;
      }
      const memOriginal = resolveServerAttempt(originalAttemptId, serverStateToken) || serverAttempts.get(originalAttemptId);
      if (!memOriginal && !originalConfig) {
        sendJson(res, 404, { error: "Original attempt configuration not found." });
        return;
      }
      const baseConfig = memOriginal ? memOriginal.config : originalConfig;
      const baseQuestions = memOriginal ? memOriginal.questions : Array.isArray(originalQuestions) ? originalQuestions : [];
      const baseAttemptId = memOriginal ? memOriginal.attemptId : String(originalAttemptId || "prev");
      const targetLang = quizLanguage === "bn" || quizLanguage === "hi" || quizLanguage === "en" ? quizLanguage : baseConfig.quizLanguage || "en";
      const validClass = [5, 6, 7, 8, 9, 10].includes(Number(baseConfig.classLevel)) ? Number(baseConfig.classLevel) : 8;
      const validCount = [5, 10, 15, 20, 30, 50].includes(Number(baseConfig.questionCount)) ? Number(baseConfig.questionCount) : Math.max(5, baseQuestions.length || 5);
      const cleanUserId = String(userId || "local_student");
      const serverHist = getUserServerHistory(cleanUserId);
      const mergedHistoryMap = /* @__PURE__ */ new Map();
      for (const item of serverHist) {
        if (item && item.fingerprint && (!item.classLevel || item.classLevel === validClass) && (!item.subject || item.subject === baseConfig.subject)) {
          mergedHistoryMap.set(item.fingerprint, item);
        }
      }
      for (const oq of baseQuestions) {
        if (oq && typeof oq.questionText === "string") {
          const fp = oq.fingerprint || computeFingerprint(oq.questionText);
          mergedHistoryMap.set(fp, {
            fingerprint: fp,
            structuralHash: oq.structuralHash || computeStructuralHash(oq.questionText),
            conceptKey: String(oq.conceptKey || ""),
            questionText: oq.questionText,
            options: Array.isArray(oq.options) ? oq.options : void 0,
            classLevel: validClass,
            subject: String(baseConfig.subject),
            topic: String(oq.topic || baseConfig.topic),
            difficulty: String(oq.difficulty || baseConfig.difficulty)
          });
        }
      }
      if (Array.isArray(clientExcludedHistory)) {
        for (const item of clientExcludedHistory) {
          if (item && typeof item.questionText === "string" && item.questionText.trim()) {
            const fp = typeof item.fingerprint === "string" && item.fingerprint.trim() ? item.fingerprint.trim() : computeFingerprint(item.questionText);
            mergedHistoryMap.set(fp, {
              fingerprint: fp,
              structuralHash: typeof item.structuralHash === "string" && item.structuralHash.trim() ? item.structuralHash.trim() : computeStructuralHash(item.questionText),
              conceptKey: String(item.conceptKey || ""),
              questionText: item.questionText.trim(),
              options: Array.isArray(item.options) ? item.options.map(String) : void 0,
              classLevel: Number(item.classLevel) || validClass,
              subject: String(item.subject || baseConfig.subject),
              topic: String(item.topic || baseConfig.topic),
              difficulty: String(item.difficulty || baseConfig.difficulty)
            });
          }
        }
      }
      const excludedFingerprintsSet = new Set(mergedHistoryMap.keys());
      if (Array.isArray(clientExcludedFingerprints)) {
        for (const fp of clientExcludedFingerprints) {
          if (typeof fp === "string" && fp.trim()) excludedFingerprintsSet.add(fp.trim());
        }
      }
      try {
        const requestedMode = normalizeServerQuizMode(body?.mode || baseConfig.mode);
        const resolvedDifficulty = requestedMode === "challenge" ? "hard" : String(baseConfig.difficulty || "mixed");
        const { questions: retakeQuestions, modelUsed, curriculumMeta } = await generateFreshVerifiedQuizQuestions({
          ai,
          classLevel: validClass,
          subject: String(baseConfig.subject),
          quizLanguage: targetLang,
          topic: String(baseConfig.topic || "All Verified Chapters"),
          difficulty: resolvedDifficulty,
          questionCount: validCount,
          questionType: String(baseConfig.questionType || "mcq"),
          existingHistory: Array.from(mergedHistoryMap.values()),
          excludedFingerprints: excludedFingerprintsSet
        });
        if (retakeQuestions.length === 0) {
          sendJson(res, 502, {
            error: "Gemini AI did not return valid questions for the retake. Please retry."
          });
          return;
        }
        recordQuestionsInServerHistory(cleanUserId, retakeQuestions);
        const timerMap = { 5: 3, 10: 7, 15: 10, 20: 15, 30: 25, 50: 45 };
        const resolvedDuration = requestedMode === "practice" ? 0 : timerMap[retakeQuestions.length] ?? timerMap[validCount] ?? 3;
        const newAttemptId = `att_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        const newAttempt = {
          attemptId: newAttemptId,
          parentAttemptId: baseAttemptId,
          userId: cleanUserId,
          config: {
            ...baseConfig,
            classLevel: validClass,
            quizLanguage: targetLang,
            chapterId: curriculumMeta.chapterId,
            textbookName: curriculumMeta.textbookName,
            board: curriculumMeta.board,
            curriculumVerificationStatus: curriculumMeta.verificationStatus,
            difficulty: resolvedDifficulty,
            questionCount: retakeQuestions.length,
            durationMinutes: resolvedDuration,
            mode: requestedMode
          },
          questions: retakeQuestions,
          lockedAnswers: {},
          markedForReview: [],
          status: "in_progress",
          startedAt: (/* @__PURE__ */ new Date()).toISOString(),
          timeTakenSeconds: 0,
          generationInfo: {
            model: modelUsed,
            source: "gemini-ai",
            board: curriculumMeta.board,
            textbookName: curriculumMeta.textbookName,
            syllabusCode: curriculumMeta.syllabusCode,
            verificationStatus: curriculumMeta.verificationStatus,
            excludedHistoryCount: excludedFingerprintsSet.size,
            uniqueConceptsCount: retakeQuestions.length,
            notice: `Fresh Retake of Attempt ${baseAttemptId.slice(-6)} in ${targetLang.toUpperCase()} \u2014 Brand-new questions generated.`
          }
        };
        serverAttempts.set(newAttemptId, newAttempt);
        sendJson(res, 200, sanitizeAttemptForClient(newAttempt));
        return;
      } catch (aiErr) {
        logServerError("Gemini retake generation failed in /api/quiz/retake", aiErr);
        const msg = String(aiErr?.message || aiErr || "").toLowerCase();
        if (msg.includes("429") || msg.includes("resource_exhausted") || msg.includes("quota")) {
          sendJson(res, 429, {
            error: "Gemini AI rate limit reached. Please wait a few seconds and click Retry Quiz Generation."
          });
          return;
        }
        if (msg.includes("503") || msg.includes("high demand") || msg.includes("unavailable")) {
          sendJson(res, 503, {
            error: "Gemini AI is currently experiencing high temporary demand. Please click Retry to generate fresh retake questions."
          });
          return;
        }
        sendJson(res, 503, {
          error: "Unable to reach Gemini AI to generate fresh retake questions. Please click Retry."
        });
        return;
      }
    }
    if (method === "POST" && routePath === "/api/quiz/from-notes") {
      const body = await readJsonBody(req);
      const {
        mcqs = [],
        classLevel = 8,
        subject = "life_science",
        quizLanguage = "en",
        topic = "Study Notes Revision",
        userId = "local_student"
      } = body || {};
      if (!Array.isArray(mcqs) || mcqs.length === 0) {
        sendJson(res, 400, { error: "No MCQs provided to create quiz." });
        return;
      }
      const validQuizLang = quizLanguage === "bn" || quizLanguage === "hi" ? quizLanguage : "en";
      const validated = [];
      for (let i = 0; i < mcqs.length; i++) {
        const v = validateAndNormalizeQuestion(
          { ...mcqs[i], questionType: "mcq" },
          {
            classLevel: Number(classLevel) || 8,
            subject: String(subject),
            quizLanguage: validQuizLang,
            topic: String(topic),
            difficulty: "medium"
          },
          i
        );
        if (v) validated.push(v);
      }
      if (validated.length === 0) {
        sendJson(res, 400, { error: "Could not validate questions from notes." });
        return;
      }
      recordQuestionsInServerHistory(String(userId), validated);
      const requestedNotesMode = normalizeServerQuizMode(body?.mode || "practice");
      const timerMap = { 5: 3, 10: 7, 15: 10, 20: 15, 30: 25, 50: 45 };
      const notesDuration = requestedNotesMode === "practice" ? 0 : timerMap[validated.length] ?? 7;
      const attemptId = `att_notes_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
      const attempt = {
        attemptId,
        userId: String(userId),
        config: {
          classLevel: Number(classLevel) || 8,
          subject: String(subject),
          quizLanguage: validQuizLang,
          topic: String(topic),
          difficulty: requestedNotesMode === "challenge" ? "hard" : "mixed",
          questionCount: validated.length,
          questionType: "mcq",
          durationMinutes: notesDuration,
          mode: requestedNotesMode
        },
        questions: validated,
        lockedAnswers: {},
        markedForReview: [],
        status: "in_progress",
        startedAt: (/* @__PURE__ */ new Date()).toISOString(),
        timeTakenSeconds: 0,
        generationInfo: {
          model: ACTIVE_GEMINI_MODEL,
          source: "gemini-ai",
          excludedHistoryCount: 0,
          uniqueConceptsCount: validated.length,
          notice: "Generated directly from your Study Notes."
        }
      };
      serverAttempts.set(attemptId, attempt);
      sendJson(res, 200, sanitizeAttemptForClient(attempt));
      return;
    }
    if (method === "POST" && routePath === "/api/quiz/reset-history") {
      const body = await readJsonBody(req);
      const { userId = "local_student" } = body || {};
      userHistoryStore.delete(String(userId));
      sendJson(res, 200, { reset: true });
      return;
    }
    if (method === "POST" && routePath === "/api/notes/process") {
      const body = await readJsonBody(req);
      const {
        title = "Study Notes",
        sourceText = "",
        fileData,
        classLevel = 8,
        subject = "life_science",
        inputLanguage = "en",
        outputLanguage = "en"
      } = body || {};
      if ((!sourceText || String(sourceText).trim().length < 10) && !fileData?.base64) {
        sendJson(res, 400, {
          error: "Please provide study notes text or upload a supported document."
        });
        return;
      }
      const ai = getAiClient();
      if (!ai) {
        logServerError(
          "Missing GEMINI_API_KEY in /api/notes/process",
          new Error("GEMINI_API_KEY is not configured in server environment variables.")
        );
        sendJson(res, 503, {
          error: "Gemini AI API key is not configured on the server. Please add GEMINI_API_KEY in your Environment Variables and redeploy."
        });
        return;
      }
      const outLangName = outputLanguage === "bn" ? "Bengali (\u09AC\u09BE\u0982\u09B2\u09BE)" : outputLanguage === "hi" ? "Hindi (\u0939\u093F\u0928\u094D\u0926\u0940)" : "English";
      const inLangName = inputLanguage === "bn" ? "Bengali (\u09AC\u09BE\u0982\u09B2\u09BE)" : inputLanguage === "hi" ? "Hindi (\u0939\u093F\u0928\u094D\u0926\u0940)" : "English";
      try {
        const parts = [];
        if (fileData?.base64 && fileData?.mimeType) {
          parts.push({
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.base64
            }
          });
        }
        parts.push({
          text: `Analyze the following Class ${classLevel} (${subject}) study notes (Input Language: ${inLangName}) and produce a complete revision package in ${outLangName} (Output Language code: ${outputLanguage}).
Title: ${title}
Notes Content:
${String(sourceText).slice(0, 18e3)}`
        });
        const { response, modelUsed } = await generateContentWithModelFallback(ai, {
          contents: { parts },
          config: {
            systemInstruction: `You are an expert tutor for Class ${classLevel} students.
Regardless of the input note language (${inLangName}), write all output fields (summary, keyConcepts, flashcards, and 5 unique MCQs) strictly in ${outLangName}.
Make explanations clear, student-friendly, and factually accurate.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: {
                  type: Type.STRING,
                  description: `Clear, simple-language summary in ${outLangName}`
                },
                keyConcepts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      example: { type: Type.STRING }
                    },
                    required: ["term", "explanation", "example"]
                  }
                },
                flashcards: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      front: { type: Type.STRING },
                      back: { type: Type.STRING }
                    },
                    required: ["front", "back"]
                  }
                },
                mcqs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questionText: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      correctIndex: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                      topic: { type: Type.STRING },
                      difficulty: { type: Type.STRING }
                    },
                    required: [
                      "questionText",
                      "options",
                      "correctIndex",
                      "explanation",
                      "topic",
                      "difficulty"
                    ]
                  }
                }
              },
              required: ["title", "summary", "keyConcepts", "flashcards", "mcqs"]
            }
          }
        });
        const parsed = parseGeminiJsonSafe(response?.text);
        if (parsed && typeof parsed === "object" && typeof parsed.summary === "string") {
          const cleanMcqs = (Array.isArray(parsed.mcqs) ? parsed.mcqs : []).map((m, idx) => ({
            id: `note_mcq_${Date.now()}_${idx}`,
            questionText: String(m.questionText || ""),
            options: Array.isArray(m.options) ? m.options.slice(0, 4).map(String) : [],
            correctIndex: Number.isInteger(m.correctIndex) && m.correctIndex >= 0 && m.correctIndex < 4 ? m.correctIndex : 0,
            explanation: String(m.explanation || ""),
            topic: String(m.topic || title),
            difficulty: m.difficulty === "easy" || m.difficulty === "hard" ? m.difficulty : "medium"
          })).filter((m) => m.questionText.length > 3 && m.options.length === 4);
          sendJson(res, 200, {
            title: parsed.title || title,
            summary: parsed.summary || "",
            keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
            flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
            mcqs: cleanMcqs,
            modelUsed
          });
          return;
        }
        sendJson(res, 502, {
          error: "Gemini AI returned an incomplete study notes analysis. Please retry."
        });
        return;
      } catch (aiErr) {
        logServerError("Gemini study notes processing failed", aiErr);
        const msg = String(aiErr?.message || aiErr || "").toLowerCase();
        if (msg.includes("429") || msg.includes("resource_exhausted") || msg.includes("quota")) {
          sendJson(res, 429, {
            error: "Gemini AI rate limit reached. Please wait a few seconds and retry."
          });
          return;
        }
        sendJson(res, 503, {
          error: "Unable to process study notes with Gemini AI right now. Please retry."
        });
        return;
      }
    }
    if (method === "POST" && routePath === "/api/chat/message") {
      const body = await readJsonBody(req);
      const {
        userId = "local_student",
        chatId = "",
        message = "",
        history = [],
        replyLanguage = "auto",
        interfaceLanguage = "en",
        stream = false
      } = body || {};
      const cleanUserId = String(userId || "local_student").trim().slice(0, 128) || "local_student";
      const trimmedMessage = typeof message === "string" ? message.trim() : "";
      if (!trimmedMessage) {
        sendJson(res, 400, {
          error: "Please enter a message before sending."
        });
        return;
      }
      if (trimmedMessage.length > 8e3) {
        sendJson(res, 400, {
          error: "Your message is too long (maximum 8,000 characters). Please shorten it and try again."
        });
        return;
      }
      const ai = getAiClient();
      if (!ai) {
        logServerError(
          "Missing GEMINI_API_KEY in /api/chat/message",
          new Error("GEMINI_API_KEY is not configured in server environment variables.")
        );
        sendJson(res, 503, {
          error: "Gemini AI API key is not configured on the server. Please add GEMINI_API_KEY in your Environment Variables and redeploy."
        });
        return;
      }
      const hasBengaliChars = /[\u0980-\u09FF]/.test(trimmedMessage);
      const hasHindiChars = /[\u0900-\u097F]/.test(trimmedMessage);
      const detectedMsgLang = hasBengaliChars ? "bn" : hasHindiChars ? "hi" : interfaceLanguage === "bn" || interfaceLanguage === "hi" ? "en" : "en";
      const targetLang = replyLanguage === "bn" || replyLanguage === "hi" || replyLanguage === "en" ? replyLanguage : detectedMsgLang;
      const langRule = replyLanguage === "bn" || hasBengaliChars ? "Reply naturally in Bengali (\u09AC\u09BE\u0982\u09B2\u09BE) unless asked for another language." : replyLanguage === "hi" || hasHindiChars ? "Reply naturally in Hindi (\u0939\u093F\u0928\u094D\u0926\u0940) unless asked for another language." : "Reply in the same language as the user message (English, Bengali, or Hindi).";
      const safeHistory = Array.isArray(history) ? history.slice(-8) : [];
      const contents = [];
      for (const item of safeHistory) {
        if (!item || typeof item.content !== "string" || !item.content.trim()) continue;
        const role = item.role === "assistant" ? "model" : "user";
        const text = item.content.trim().slice(0, 1200);
        if (contents.length === 0 && role === "model") continue;
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += `

${text}`;
        } else {
          contents.push({ role, parts: [{ text }] });
        }
      }
      if (contents.length > 0 && contents[contents.length - 1].role === "user") {
        if (contents[contents.length - 1].parts[0].text !== trimmedMessage) {
          contents[contents.length - 1].parts[0].text += `

${trimmedMessage}`;
        }
      } else {
        contents.push({ role: "user", parts: [{ text: trimmedMessage }] });
      }
      const systemInstruction = `You are a fast, accurate, and natural AI assistant. Answer the user's exact question directly. Never add unsolicited introductions. ${langRule}`;
      const resolvedChatId = typeof chatId === "string" && chatId.trim() ? chatId.trim().replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 100) : `chat_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const persistChatTurn = (rawReply, modelUsed) => {
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
        const userMsgObj = {
          id: `msg_u_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
          role: "user",
          content: trimmedMessage,
          timestamp: nowIso,
          language: detectedMsgLang
        };
        const assistantMsgObj = {
          id: `msg_a_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
          role: "assistant",
          content: rawReply,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          language: targetLang,
          modelUsed
        };
        const userChats = getUserChatMap(cleanUserId);
        const existingConv = userChats.get(resolvedChatId);
        const generatedTitle = existingConv?.title || trimmedMessage.replace(/\s+/g, " ").slice(0, 64) + (trimmedMessage.length > 64 ? "\u2026" : "");
        const updatedMessages = existingConv ? [...existingConv.messages, userMsgObj, assistantMsgObj].slice(-100) : [
          ...safeHistory.filter((m) => m && typeof m.content === "string" && m.content.trim()).map((m, idx) => ({
            id: String(m.id || `msg_h_${idx}`),
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content).trim(),
            timestamp: String(m.timestamp || nowIso),
            language: m.language === "bn" || m.language === "hi" ? m.language : "en",
            modelUsed: m.modelUsed ? String(m.modelUsed) : void 0
          })),
          userMsgObj,
          assistantMsgObj
        ].slice(-100);
        const updatedConv = {
          chatId: resolvedChatId,
          userId: cleanUserId,
          title: generatedTitle,
          language: targetLang,
          messages: updatedMessages,
          createdAt: existingConv?.createdAt || nowIso,
          updatedAt: assistantMsgObj.timestamp
        };
        userChats.set(resolvedChatId, updatedConv);
        return {
          chatId: resolvedChatId,
          title: generatedTitle,
          userMessage: userMsgObj,
          assistantMessage: assistantMsgObj,
          modelUsed
        };
      };
      const wantStream = Boolean(stream) || String(req.headers?.accept || "").includes("text/event-stream");
      if (wantStream) {
        let headersSent = false;
        const ensureSseHeaders = () => {
          if (headersSent) return;
          headersSent = true;
          res.statusCode = 200;
          if (typeof res.setHeader === "function") {
            res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
            res.setHeader("Cache-Control", "no-cache, no-transform");
            res.setHeader("Connection", "keep-alive");
            res.setHeader("X-Accel-Buffering", "no");
          }
          if (typeof res.flushHeaders === "function") {
            res.flushHeaders();
          }
        };
        const writeSse = (payload) => {
          ensureSseHeaders();
          const line = `data: ${JSON.stringify(payload)}

`;
          if (typeof res.write === "function") {
            res.write(line);
          }
          if (typeof res.flush === "function") {
            res.flush();
          }
        };
        const chatModels = getOrderedCandidateModels();
        let lastErr = null;
        for (let i = 0; i < chatModels.length; i++) {
          const modelName = chatModels[i];
          try {
            const thinkingConfig = modelName === "gemini-3-flash-preview" || modelName === "gemini-3.8-flash" ? { thinkingLevel: ThinkingLevel.LOW } : modelName.startsWith("gemini-2.5") || modelName === "gemini-flash-latest" || modelName === "gemini-flash-lite-latest" ? { thinkingBudget: 0 } : void 0;
            const streamResponse = await withTimeout(
              ai.models.generateContentStream({
                model: modelName,
                contents,
                config: {
                  systemInstruction,
                  temperature: 0.7,
                  ...thinkingConfig ? { thinkingConfig } : {}
                }
              }),
              15e3,
              `Gemini generateContentStream (${modelName})`
            );
            let accumulated = "";
            for await (const chunk of streamResponse) {
              const delta = typeof chunk?.text === "string" ? chunk.text : "";
              if (delta) {
                accumulated += delta;
                writeSse({ type: "delta", text: delta });
              }
            }
            const finalReply = accumulated.trim();
            if (!finalReply) {
              throw new Error("Gemini AI returned an empty stream.");
            }
            modelCooldownUntil.delete(modelName);
            const savedPayload = persistChatTurn(finalReply, modelName);
            writeSse({
              type: "done",
              ...savedPayload
            });
            if (typeof res.end === "function") {
              res.end();
            }
            return;
          } catch (streamErr) {
            lastErr = streamErr;
            const msg = String(streamErr?.message || streamErr || "").toLowerCase();
            recordModelFailureCooldown(modelName, streamErr);
            if (headersSent || msg.includes("api_key_invalid") || msg.includes("api key not valid")) {
              break;
            }
          }
        }
        logServerError("Gemini AI Chat stream failed in /api/chat/message", lastErr);
        const errMsg = String(lastErr?.message || lastErr || "").toLowerCase();
        const isInvalidKey = errMsg.includes("api_key_invalid") || errMsg.includes("api key not valid");
        const isRateLimit = errMsg.includes("429") || errMsg.includes("resource_exhausted") || errMsg.includes("quota");
        const clientErrorText = isInvalidKey ? "The configured GEMINI_API_KEY on the server was rejected as invalid. Please verify GEMINI_API_KEY in your Environment Variables and redeploy." : isRateLimit ? "Gemini AI rate limit reached. Please wait a few seconds and retry your message." : "Unable to reach Gemini AI right now. Please check your connection or retry in a moment.";
        if (!headersSent) {
          sendJson(res, isRateLimit ? 429 : 503, { error: clientErrorText });
        } else {
          writeSse({ type: "error", error: clientErrorText });
          if (typeof res.end === "function") {
            res.end();
          }
        }
        return;
      }
      try {
        const { response, modelUsed } = await generateContentWithModelFallback(ai, {
          contents,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });
        const rawReply = typeof response?.text === "string" ? response.text.trim() : "";
        if (!rawReply) {
          sendJson(res, 502, {
            error: "Gemini AI returned an empty response. Please try sending your message again."
          });
          return;
        }
        const savedPayload = persistChatTurn(rawReply, modelUsed);
        sendJson(res, 200, savedPayload);
        return;
      } catch (aiErr) {
        logServerError("Gemini AI Chat failed in /api/chat/message", aiErr);
        const msg = String(aiErr?.message || aiErr || "").toLowerCase();
        if (msg.includes("api_key_invalid") || msg.includes("api key not valid")) {
          sendJson(res, 503, {
            error: "The configured GEMINI_API_KEY on the server was rejected as invalid. Please verify GEMINI_API_KEY in your Environment Variables and redeploy."
          });
          return;
        }
        if (msg.includes("429") || msg.includes("resource_exhausted") || msg.includes("quota")) {
          sendJson(res, 429, {
            error: "Gemini AI rate limit reached. Please wait a few seconds and retry your message."
          });
          return;
        }
        sendJson(res, 503, {
          error: "Unable to reach Gemini AI right now. Please check your connection or retry in a moment."
        });
        return;
      }
    }
    if (method === "POST" && routePath === "/api/chat/history") {
      const body = await readJsonBody(req);
      const cleanUserId = String(body?.userId || "local_student").trim().slice(0, 128) || "local_student";
      const userChats = getUserChatMap(cleanUserId);
      const list = Array.from(userChats.values()).sort(
        (a, b) => b.updatedAt.localeCompare(a.updatedAt)
      );
      sendJson(res, 200, {
        userId: cleanUserId,
        conversations: list
      });
      return;
    }
    if (method === "POST" && routePath === "/api/chat/delete") {
      const body = await readJsonBody(req);
      const cleanUserId = String(body?.userId || "local_student").trim().slice(0, 128) || "local_student";
      const { chatId, clearAll } = body || {};
      const userChats = getUserChatMap(cleanUserId);
      if (clearAll) {
        userChats.clear();
      } else if (typeof chatId === "string" && chatId.trim()) {
        userChats.delete(chatId.trim());
      }
      sendJson(res, 200, { deleted: true });
      return;
    }
    sendJson(res, 404, {
      error: `API route not found: ${method} ${routePath}`
    });
  } catch (err) {
    logServerError("Unhandled top-level API error", err);
    sendJson(res, 500, {
      error: err?.message || "An unexpected server error occurred while processing your request."
    });
  }
}
export {
  config,
  handler as default
};
