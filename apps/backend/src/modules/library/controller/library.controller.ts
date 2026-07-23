import { Request, Response } from 'express';
import { LibraryService } from '../service/library.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';

export class LibraryController {
  private libraryService: LibraryService;

  constructor() {
    this.libraryService = new LibraryService();
  }

  public createContent = async (req: Request, res: Response) => {
    const currentUserId = (req as any).user.userId;
    const content = await this.libraryService.createContent(req.body, currentUserId);
    return res.status(201).json(ApiResponse.success('Content created successfully', content));
  };

  public getContent = async (req: Request, res: Response) => {
    const content = await this.libraryService.getContent(req.params.id as string);
    return res.status(200).json(ApiResponse.success('Content retrieved successfully', content));
  };

  public listContent = async (req: Request, res: Response) => {
    const result = await this.libraryService.listContent(req.query as any);
    return res.status(200).json(ApiResponse.success('Content retrieved successfully', result));
  };

  public updateContent = async (req: Request, res: Response) => {
    const currentUserId = (req as any).user.userId;
    const content = await this.libraryService.updateContent(req.params.id as string, req.body, currentUserId);
    return res.status(200).json(ApiResponse.success('Content updated successfully', content));
  };

  public publishContent = async (req: Request, res: Response) => {
    const currentUserId = (req as any).user.userId;
    const content = await this.libraryService.publishContent(req.params.id as string, currentUserId);
    return res.status(200).json(ApiResponse.success('Content published successfully', content));
  };

  public archiveContent = async (req: Request, res: Response) => {
    const currentUserId = (req as any).user.userId;
    const content = await this.libraryService.archiveContent(req.params.id as string, currentUserId);
    return res.status(200).json(ApiResponse.success('Content archived successfully', content));
  };

  public deleteContent = async (req: Request, res: Response) => {
    const currentUserId = (req as any).user.userId;
    await this.libraryService.softDeleteContent(req.params.id as string, currentUserId);
    return res.status(200).json(ApiResponse.success('Content deleted successfully'));
  };

  public restoreContent = async (req: Request, res: Response) => {
    const currentUserId = (req as any).user.userId;
    const content = await this.libraryService.restoreContent(req.params.id as string, currentUserId);
    return res.status(200).json(ApiResponse.success('Content restored successfully', content));
  };

  public createVersion = async (req: Request, res: Response) => {
    const currentUserId = (req as any).user.userId;
    const content = await this.libraryService.createVersion(req.params.id as string, req.body, currentUserId);
    return res.status(201).json(ApiResponse.success('Version created successfully', content));
  };
}
