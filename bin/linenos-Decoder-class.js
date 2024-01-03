import path from 'path';
import { Project } from 'ts-morph';

const branch = 'main';
let output = [];

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

for (const src of project.getSourceFiles('src/core/Decoder.ts')) {
  const func = src.getFunction('define');
  const members = func.getFunctions();

  for (const member of members) {
    // Grab the first JSDoc, which, technically, may live on an overload
    // declaration
    const comment =
      [...member.getJsDocs()]
        .map((x) => x.getCommentText()?.trim())
        .filter(Boolean)?.[0] ?? null;

    const start = Math.min(
      member.getStartLineNumber(),
      ...member.getJsDocs().map((doc) => doc.getStartLineNumber()),
      ...member.getOverloads().map((ov) => ov.getStartLineNumber()),
      ...member
        .getOverloads()
        .flatMap((ov) => ov.getJsDocs().map((doc) => doc.getStartLineNumber())),
    );
    const end = Math.max(
      member.getEndLineNumber(),
      ...member.getJsDocs().map((doc) => doc.getEndLineNumber()),
      ...member.getOverloads().map((ov) => ov.getEndLineNumber()),
      ...member
        .getOverloads()
        .flatMap((ov) => ov.getJsDocs().map((doc) => doc.getEndLineNumber())),
    );

    const localPath = path.relative('.', src.getFilePath());
    const remotePath = `https://github.com/nvie/decoders/tree/${branch}/${localPath}`;
    const remote = `${remotePath}#L${start}-L${end}`;

    output.push({
      name: member.getName(),
      comment,
      span: { start, end },
      localPath,
      remotePath,
      remote,
    });
  }

  // const start = Math.min(
  //   type.getStartLineNumber(),
  //   ...type.getJsDocs().map((doc) => doc.getStartLineNumber()),
  //   ...type.getOverloads().map((ov) => ov.getStartLineNumber()),
  //   ...type
  //     .getOverloads()
  //     .flatMap((ov) => ov.getJsDocs().map((doc) => doc.getStartLineNumber())),
  // );
  // const end = Math.max(
  //   type.getEndLineNumber(),
  //   ...type.getJsDocs().map((doc) => doc.getEndLineNumber()),
  //   ...type.getOverloads().map((ov) => ov.getEndLineNumber()),
  //   ...type
  //     .getOverloads()
  //     .flatMap((ov) => ov.getJsDocs().map((doc) => doc.getEndLineNumber())),
  // );

  // const localPath = path.relative('.', src.getFilePath());
  // const remotePath = `https://github.com/nvie/decoders/tree/${branch}/${localPath}`;
  // const remote = `${remotePath}#L${start}-L${end}`;

  // output.push({
  //   name: type.getName(),
  //   comment,
  //   span: { start, end },
  //   localPath,
  //   remotePath,
  //   remote,
  // });
  // }

  // for (const stm of src.getVariableStatements()) {
  // if (!stm.hasExportKeyword()) continue;

  // // Grab the first JSDoc, which, technically, may live on an overload
  // // declaration
  // const comment =
  //   [...stm.getJsDocs()].map((x) => x.getCommentText()?.trim()).filter(Boolean)?.[0] ??
  //   null;

  // for (const variable of stm.getDeclarations()) {
  //   const start = Math.min(
  //     variable.getStartLineNumber(),
  //     ...stm.getJsDocs().map((doc) => doc.getStartLineNumber()),
  //   );
  //   const end = Math.max(
  //     variable.getEndLineNumber(),
  //     ...stm.getJsDocs().map((doc) => doc.getEndLineNumber()),
  //   );
  //   const localPath = path.relative('.', src.getFilePath());
  //   const remotePath = `https://github.com/nvie/decoders/tree/${branch}/${localPath}`;
  //   const remote = `${remotePath}#L${start}-L${end}`;

  //   output.push({
  //     name: variable.getName(),
  //     comment,
  //     span: { start, end },
  //     localPath,
  //     remotePath,
  //     remote,
  //   });
  // }
}

console.log(JSON.stringify(output, null, 2));
