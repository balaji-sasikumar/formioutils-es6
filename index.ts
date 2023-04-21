import * as _clone from "lodash/clone.js";
const eachComponent = (
  components,
  fn,
  includeAll,
  path = "",
  parent = null
) => {
  if (!components) return;
  path = path || "";
  components.forEach((component) => {
    if (!component) {
      return;
    }

    let hasColumns = component.columns && Array.isArray(component.columns);
    let hasRows = component.rows && Array.isArray(component.rows);
    let hasComps = component.components && Array.isArray(component.components);
    let noRecurse = false;
    let newPath = component.key
      ? path
        ? "".concat(path, ".").concat(component.key)
        : component.key
      : ""; // Keep track of parent references.

    if (parent) {
      // Ensure we don't create infinite JSON structures.
      component.parent = _clone.default(parent);
      delete component.parent.components;
      delete component.parent.componentMap;
      delete component.parent.columns;
      delete component.parent.rows;
    } // there's no need to add other layout components here because we expect that those would either have columns, rows or components

    let layoutTypes = ["htmlelement", "content"];
    let isLayoutComponent =
      hasColumns ||
      hasRows ||
      hasComps ||
      layoutTypes.indexOf(component.type) > -1;

    if (includeAll || component.tree || !isLayoutComponent) {
      noRecurse = fn(component, newPath, components);
    }

    let subPath = function subPath() {
      if (
        component.key &&
        ![
          "panel",
          "table",
          "well",
          "columns",
          "fieldset",
          "tabs",
          "form",
        ].includes(component.type) &&
        (["datagrid", "container", "editgrid", "address"].includes(
          component.type
        ) ||
          component.tree)
      ) {
        return newPath;
      } else if (component.key && component.type === "form") {
        return "".concat(newPath, ".data");
      }

      return path;
    };

    if (!noRecurse) {
      if (hasColumns) {
        component.columns.forEach(function (column) {
          return eachComponent(
            column.components,
            fn,
            includeAll,
            subPath(),
            parent ? component : null
          );
        });
      } else if (hasRows) {
        component.rows.forEach(function (row) {
          if (Array.isArray(row)) {
            row.forEach(function (column) {
              return eachComponent(
                column.components,
                fn,
                includeAll,
                subPath(),
                parent ? component : null
              );
            });
          }
        });
      } else if (hasComps) {
        eachComponent(
          component.components,
          fn,
          includeAll,
          subPath(),
          parent ? component : null
        );
      }
    }
  });
};

export const flattenComponents = (components, includeAll) => {
  let flattened = {};
  eachComponent(
    components,
    function (component, path) {
      flattened[path] = component;
    },
    includeAll
  );
  return flattened;
};

export default flattenComponents;
