import PropertyValueController from '../controllers/PropertyValueController';
import { AuthRequest } from '../middlewares/authrequest';

export const initializePropertyValueRoutes = (propertyValueControllerObject: PropertyValueController): void => {
  propertyValueControllerObject._router.get(
    `${propertyValueControllerObject._urlPath}/:propertyId`,
    [AuthRequest],
    propertyValueControllerObject.getProperty
  );

  propertyValueControllerObject._router.post(
    `${propertyValueControllerObject._urlPath}/all`,
    [AuthRequest],
    propertyValueControllerObject.getAllProperties
  );

  propertyValueControllerObject._router.post(
    `${propertyValueControllerObject._urlPath}/`,
    [AuthRequest],
    propertyValueControllerObject.createProperty
  );

  propertyValueControllerObject._router.post(
    `${propertyValueControllerObject._urlPath}/:propertyId/value`,
    [AuthRequest],
    propertyValueControllerObject.addPropertyValue
  );

  propertyValueControllerObject._router.delete(
    `${propertyValueControllerObject._urlPath}/:propertyId`,
    [AuthRequest],
    propertyValueControllerObject.removeProperty
  );

  propertyValueControllerObject._router.delete(
    `${propertyValueControllerObject._urlPath}/:propertyId/value`,
    [AuthRequest],
    propertyValueControllerObject.deletePropertyValue
  );
};
