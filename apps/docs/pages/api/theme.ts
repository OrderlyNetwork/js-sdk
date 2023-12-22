import type { NextApiRequest, NextApiResponse } from "next";
// const postcss = require('postcss')
// const postcssJs = require('postcss-js')
// const path = require('path')
// const fs = require('fs')
import postcss from "postcss";
import postcssJs from "postcss-js";
import path from "path";
import fs from "node:fs/promises";
import theme from "../../server/theme";

type ResponseData = {
  theme: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  //   console.log(theme);

  res.status(200).json({ theme });
}
