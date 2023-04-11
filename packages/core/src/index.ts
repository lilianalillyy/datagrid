import { Datagrid } from "./Datagrid";
import { Happy } from "./Happy";
import * as extensions from "./extensions";
import { ExtendedWindow } from "./types";

import "./assets/happy.css";

const Liliana: ExtendedWindow["Liliana"] = {
  Datagrid,
  Happy,
  ...extensions,
};

export default Liliana;
