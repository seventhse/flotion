import { FlotionElement, FlotionElementsMap } from "./interface";
import { GeometricShape, getPolygonShape } from "./utils";

export function getElementShape(element: FlotionElement, elementsMap: FlotionElementsMap): GeometricShape {
  switch (element.type) {
    case "rectangle":
    case "diamond":
    case "ellipse":
    case "selection":
      return getPolygonShape(element)
  }
}

