import html
import re
import textwrap
from _data import DECODERS, DECODER_METHODS, LOCATIONS


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


def linkify(text):
  return re.sub('([^`[])`[.]?([\w]+)([()]+)?`', replace_with_link, text,)


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
  info = DECODERS[name]
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
  info = DECODERS[name]

  signatures = []
  aliases = []

  for siginfo in get_signatures(name):
    params = '' if not siginfo['params'] else '(' + ', '.join([(f'{safe(pname)}: {format_type(ptype)}' if pname else f'{format_type(ptype)}') if ptype else f'{safe(pname)}' for (pname, ptype) in siginfo['params']]) + ')'
    type_params = '' if not siginfo.get('type_params') else safe('<') + ', '.join([format_type(ptype) for ptype in siginfo['type_params']]) + safe('>')
    return_type = format_type(siginfo['return_type'])
    signatures.append(f'<a name="{name}" href="#{name}">#</a>\n**{name}**{type_params}{params}: {return_type} {source_link(name)}')
    for alias in info.get('aliases', []):
      aliases.append(f'<a name="{alias}" href="#{alias}">#</a>\n**{alias}**{type_params}{params}: {return_type} {source_link(alias)}')

  heading = '  \n'.join([*signatures, *aliases])
  return heading
