export interface IFile{
  name: string,
  path: string,
  extension: string
  size: string,
  hidden: boolean,
  created: Date | string,
  modified: Date | string,
  edit: boolean
}