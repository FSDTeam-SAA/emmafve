
    //TODO: customize as needed
    
    export interface IStories {
  _id: string;
  title: string;
  description: string;
  status?: string;
  isDeleted?: boolean;
  slug?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateStories {
  title: string;
  description?: string;
  status?: string;
}
