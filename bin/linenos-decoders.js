import path from 'path';
import { Project } from 'ts-morph';

const branch = 'main';
let output = [];

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

for (const src of project.getSourceFiles('src/**')) {
  for (const func of src.getFunctions()) {
    if (!func.hasExportKeyword()) continue;

    // Grab the first JSDoc, which, technically, may live on an overload
    // declaration
    const comment =
      [...func.getJsDocs(), ...func.getOverloads().flatMap((ov) => ov.getJsDocs())]
        .map((x) => x.getCommentText()?.trim())
        .filter(Boolean)?.[0] ?? null;

    const start = Math.min(
      func.getStartLineNumber(),
      ...func.getJsDocs().map((doc) => doc.getStartLineNumber()),
      ...func.getOverloads().map((ov) => ov.getStartLineNumber()),
      ...func
        .getOverloads()
        .flatMap((ov) => ov.getJsDocs().map((doc) => doc.getStartLineNumber())),
    );
    const end = Math.max(
      func.getEndLineNumber(),
      ...func.getJsDocs().map((doc) => doc.getEndLineNumber()),
      ...func.getOverloads().map((ov) => ov.getEndLineNumber()),
      ...func
        .getOverloads()
        .flatMap((ov) => ov.getJsDocs().map((doc) => doc.getEndLineNumber())),
    );

    const localPath = path.relative('.', src.getFilePath());
    const remotePath = `https://github.com/nvie/decoders/tree/${branch}/${localPath}`;
    const remote = `${remotePath}#L${start}-L${end}`;

    output.push({
      name: func.getName(),
      comment,
      span: { start, end },
      localPath,
      remotePath,
      remote,
    });
  }

  for (const stm of src.getVariableStatements()) {
    if (!stm.hasExportKeyword()) continue;

    // Grab the first JSDoc, which, technically, may live on an overload
    // declaration
    const comment =
      [...stm.getJsDocs()].map((x) => x.getCommentText()?.trim()).filter(Boolean)?.[0] ??
      null;

    for (const variable of stm.getDeclarations()) {
      const start = Math.min(
        variable.getStartLineNumber(),
        ...stm.getJsDocs().map((doc) => doc.getStartLineNumber()),
      );
      const end = Math.max(
        variable.getEndLineNumber(),
        ...stm.getJsDocs().map((doc) => doc.getEndLineNumber()),
      );
      const localPath = path.relative('.', src.getFilePath());
      const remotePath = `https://github.com/nvie/decoders/tree/${branch}/${localPath}`;
      const remote = `${remotePath}#L${start}-L${end}`;

      output.push({
        name: variable.getName(),
        comment,
        span: { start, end },
        localPath,
        remotePath,
        remote,
      });
    }
  }
}

console.log(JSON.stringify(output, null, 2));
