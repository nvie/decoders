import html
import re
import textwrap
from _data import DECODERS, DECODER_METHODS, LOCATIONS, DOC_STRINGS


def safe(s):
  return html.escape(s)


def replace_with_link(matchobj):
    prefix = matchobj.group(1)
    name = matchobj.group(2)

    decoder = DECODERS.get(name)
    method = DECODER_METHODS.get(name)
    if decoder:
      return f'{prefix}{ref(name)}'
    elif method:
      return f'{prefix}{methodref(name)}'
    else:
      # Return the fully matched text (aka don't replace)
      return matchobj.group(0)


def is_empty(line):
  return re.match(r'^\s*$', line) is not None


def isplitlines(text):
  # Splits text into lines, and strips off blank lines from the start and end
  # of the string
  lines = text.splitlines()

  # Spacer can be `None` or `''`
  emit_count = 0
  spacer = None

  for line in lines:
    if is_empty(line):
      if emit_count > 0:
        spacer = ''
      continue
    else:
      if spacer is not None:
        yield spacer
        spacer = None
        emit_count += 1
      yield line
      emit_count += 1


def unindent(text):
  # The idea:
  # - Look at the first non-empty line
  # - Capture the leading whitespace prefix for that line
  # - Strip it from all the other lines uniformly

  lines = list(isplitlines(text))
  if not lines:
    return text

  ws_prefix = None
  for line in lines:
    if is_empty(line):
      continue

    ws_prefix = re.match(r'^\s*', line).group(0)
    break

  if ws_prefix:
    lines = map(
      lambda line: line[len(ws_prefix):] if line.startswith(ws_prefix) else line,
      lines,
    )

  return '\n'.join(lines)


def get_info(name):
  info = DECODERS.get(name, None) or DECODER_METHODS.get(name, None)
  assert info, f'No such decoder or Decoder method name: {name}'
  return info


def get_raw_markdown(name):
  info = get_info(name)

  doc_string = unindent(info.get('markdown', None) or DOC_STRINGS.get(name, None) or '')
  raw_example = unindent(info.get('example', ''))
  example = f'```ts\n{raw_example}\n```' if raw_example and '```' not in raw_example else raw_example
  return '\n\n'.join(filter(lambda x: x, [doc_string, example]))


def get_markdown(name):
  return linkify(get_raw_markdown(name))


def linkify(text):
  return re.sub(r'([^`[])`[.]?([\w]+)([()]+)?`', replace_with_link, text)


def linkify_decoder_class(text):
  return re.sub('Decoder', '<a href="/Decoder.html" style="color: inherit">Decoder</a>', text)


def format_type(s):
  return f'<i style="color: #267f99">{linkify_decoder_class(safe(s))}</i>'


def reindent(s, prefix = ''):
  return textwrap.indent(textwrap.dedent(s), prefix).strip()


def ref(name):
  decoder = DECODERS.get(name)
  if decoder is not None:
    if is_function(name):
      return f'[`{name}()`](/api.html#{name})'
  return f'[`{name}`](/api.html#{name})'


def methodref(name):
  return f'[`.{name}()`](/Decoder.html#{name})'


def source_link(name):
  source = LOCATIONS.get(name)
  return f"[<small>(source)</small>]({source} 'Source')" if source else ''


def slugify(s):
  return re.sub('[^a-z0-9]+', '-', s.lower())


def is_function(name):
  return any(sig.get('params') is not None for sig in get_signatures(name))


def get_signatures(name):
  info = get_info(name)
  if signatures := info.get('signatures'):
    return signatures

  return [
    {
      'params': info.get('params', None),
      'type_params': info.get('type_params', None),
      'return_type': info.get('return_type', None),
    },
  ]


def get_signature_html(name):
  info = get_info(name)

  signatures = []
  aliases = []

  dot = '.' if name in DECODER_METHODS else ''
  for siginfo in get_signatures(name):
    params = '' if not siginfo['params'] else '(' + ', '.join([(f'{safe(pname)}: {format_type(ptype)}' if pname else f'{format_type(ptype)}') if ptype else f'{safe(pname)}' for (pname, ptype) in siginfo['params']]) + ')'
    type_params = '' if not siginfo.get('type_params') else safe('<') + ', '.join([format_type(ptype) for ptype in siginfo['type_params']]) + safe('>')
    return_type = format_type(siginfo['return_type'])
    signatures.append(f'<a href="#{name}">#</a> **{dot}{name}**{type_params}{params}: {return_type} {source_link(name)}\n{{: #{name} .signature}}')
    for alias in info.get('aliases', []):
      aliases.append(f'<a href="#{alias}">#</a> **{dot}{alias}**{type_params}{params}: {return_type} {source_link(alias)}\n{{: #{alias} .signature}}')

  heading = '\n\n'.join([*signatures, *aliases])
  return heading
