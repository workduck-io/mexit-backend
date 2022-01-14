export interface Workspace {
  id: string;
  name: string;
}

export interface Namespace {
  id: string;
  workspaceIdentifier: string;
  name: string;
}
