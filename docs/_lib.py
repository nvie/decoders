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
    if decoder.get('params') is not None:
      return f'[`{name}()`](/api.html#{name})'
  return f'[`{name}`](/api.html#{name})'


def methodref(name):
  return f'[`.{name}()`](/Decoder.html#{name})'


def source_link(name):
  source = LOCATIONS.get(name)
  return f"[<small>(source)</small>]({source} 'Source')" if source else ''


def slugify(s):
  return re.sub('[^a-z0-9]+', '-', s.lower())
