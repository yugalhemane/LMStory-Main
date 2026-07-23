import { Router } from 'express';
import { CourseController } from '../controller/course.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../../auth/middleware/auth.middleware';
import { requireTenantAdmin } from '../../../shared/middlewares/requireRole';
import { 
  createCourseSchema, 
  updateCourseSchema, 
  listCoursesSchema, 
  createCourseSectionSchema, 
  addCourseItemSchema, 
  reorderItemsSchema 
} from '../validation/course.validation';

const router = Router();
const courseController = new CourseController();

// Restrict to Tenant Admin
router.use(requireAuth, requireTenantAdmin);

// Courses CRUD
router.post('/', validate(createCourseSchema as any), asyncHandler(courseController.createCourse));
router.get('/', validate(listCoursesSchema as any), asyncHandler(courseController.listCourses));
router.get('/:id', asyncHandler(courseController.getCourse));
router.patch('/:id', validate(updateCourseSchema as any), asyncHandler(courseController.updateCourse));
router.delete('/:id', asyncHandler(courseController.deleteCourse));
router.post('/:id/restore', asyncHandler(courseController.restoreCourse));

// Actions
router.post('/:id/publish', asyncHandler(courseController.publishCourse));
router.post('/:id/version', asyncHandler(courseController.createVersion));

// Sections
router.post('/:id/sections', validate(createCourseSectionSchema as any), asyncHandler(courseController.addSection));
router.patch('/:id/sections/reorder', validate(reorderItemsSchema as any), asyncHandler(courseController.reorderSections));

// Items
router.post('/:id/sections/:sectionId/items', validate(addCourseItemSchema as any), asyncHandler(courseController.addItem));
router.patch('/:id/sections/:sectionId/items/reorder', validate(reorderItemsSchema as any), asyncHandler(courseController.reorderItems));

export default router;
