import { Request, Response } from 'express';
import { CourseService } from '../service/course.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  public createCourse = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const course = await this.courseService.createCourse(tenantId, req.body, currentUserId);
    return res.status(201).json(ApiResponse.success('Course created successfully', course));
  };

  public getCourse = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const course = await this.courseService.getCourse(req.params.id as string, tenantId);
    return res.status(200).json(ApiResponse.success('Course retrieved successfully', course));
  };

  public listCourses = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const result = await this.courseService.listCourses(tenantId, req.query as any);
    return res.status(200).json(ApiResponse.success('Courses retrieved successfully', result));
  };

  public updateCourse = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const course = await this.courseService.updateCourse(req.params.id as string, tenantId, req.body, currentUserId);
    return res.status(200).json(ApiResponse.success('Course updated successfully', course));
  };

  public deleteCourse = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    await this.courseService.deleteCourse(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('Course deleted successfully'));
  };

  public restoreCourse = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const course = await this.courseService.restoreCourse(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('Course restored successfully', course));
  };

  public publishCourse = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    const course = await this.courseService.publishCourse(req.params.id as string, tenantId, currentUserId);
    return res.status(200).json(ApiResponse.success('Course published successfully', course));
  };

  public createVersion = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const currentUserId = (req as any).user.userId;
    await this.courseService.createVersion(req.params.id as string, tenantId, currentUserId, req.body.changeLog);
    return res.status(201).json(ApiResponse.success('Version created successfully'));
  };

  // --- SECTIONS ---

  public addSection = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const section = await this.courseService.addSection(req.params.id as string, tenantId, req.body);
    return res.status(201).json(ApiResponse.success('Section added successfully', section));
  };

  public reorderSections = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    await this.courseService.reorderSections(req.params.id as string, tenantId, req.body.orderedIds);
    return res.status(200).json(ApiResponse.success('Sections reordered successfully'));
  };

  // --- ITEMS ---

  public addItem = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    const item = await this.courseService.addItem(req.params.id as string, req.params.sectionId as string, tenantId, req.body);
    return res.status(201).json(ApiResponse.success('Item added successfully', item));
  };

  public reorderItems = async (req: Request, res: Response) => {
    const tenantId = (req as any).user.tenantId;
    await this.courseService.reorderItems(req.params.id as string, req.params.sectionId as string, tenantId, req.body.orderedIds);
    return res.status(200).json(ApiResponse.success('Items reordered successfully'));
  };
}
