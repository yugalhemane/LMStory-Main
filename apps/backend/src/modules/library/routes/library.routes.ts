import { Router } from 'express';
import { LibraryController } from '../controller/library.controller';
import { asyncHandler } from '../../../shared/helpers/asyncHandler';
import { validate } from '../../../shared/helpers/validate';
import { requireAuth } from '../../auth/middleware/auth.middleware';
import { requireSuperAdmin } from '../../../shared/middlewares/requireSuperAdmin';
import { 
  createLibraryContentSchema, 
  updateLibraryContentSchema, 
  listLibraryContentSchema, 
  createVersionSchema 
} from '../validation/library.validation';

const router = Router();
const libraryController = new LibraryController();

// IMPORTANT: Global Library is STRICTLY Super Admin for all write operations.
// For now, we apply requireSuperAdmin to the entire module.
// In the future, GET endpoints might be accessible for Tenants to view content before cloning.
router.use(requireAuth, requireSuperAdmin);

router.post('/', validate(createLibraryContentSchema as any), asyncHandler(libraryController.createContent));
router.get('/', validate(listLibraryContentSchema as any), asyncHandler(libraryController.listContent));
router.get('/:id', asyncHandler(libraryController.getContent));
router.patch('/:id', validate(updateLibraryContentSchema as any), asyncHandler(libraryController.updateContent));
router.delete('/:id', asyncHandler(libraryController.deleteContent));
router.post('/:id/restore', asyncHandler(libraryController.restoreContent));

router.post('/:id/publish', asyncHandler(libraryController.publishContent));
router.post('/:id/archive', asyncHandler(libraryController.archiveContent));
router.post('/:id/version', validate(createVersionSchema as any), asyncHandler(libraryController.createVersion));

export default router;
