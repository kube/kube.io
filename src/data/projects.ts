
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

export type Project = {
  default: any;
  metadata: {
    index: number;
    title: string;
    subtitle?: string;
    text?: string;
    picture?: string;
    youtube?: string;
    github?: string;
    npm?: string;
  };
};

export default Object.values(
  import.meta.glob<true, string, Project>('./projects/*.md', { eager: true })
).sort((a, b) => (a.metadata.index < b.metadata.index ? 1 : -1));
