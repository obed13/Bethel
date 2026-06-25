import {useRef} from 'react'
import Field from '../components/Field';
import Card from '../components/Card';
import AddBtn from '../components/AddBtn';
import DelBtn from '../components/DelBtn';

const FooterSection = ({ data, onChange }) => {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  const listRef = useRef(null);

  const add = () => {
    const newLinks = [...data.links, { label: "Nuevo enlace", url: "#" }];
    onChange({ ...data, links: newLinks });
    setTimeout(() => {
      listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  const del = (i) => onChange({ ...data, links: data.links.filter((_, idx) => idx !== i) });
  const set = (i, key, val) => {
    const arr = [...data.links];
    arr[i] = { ...arr[i], [key]: val };
    onChange({ ...data, links: arr });
  };
  return (
    <div className="flex flex-col gap-4">
      <Field label="Descripción de la iglesia" value={data.tagline}   onChange={s("tagline")}   type="textarea" />
      <Field label="Texto de copyright"         value={data.copyright} onChange={s("copyright")} placeholder="© 2026 CFC Bethel." />
      <Card title="Enlaces rápidos" action={<AddBtn onClick={add} />}>
        {(data.links || []).length === 0 ?  (
          <p className="text-sm text-slate-400 text-center py-4">Sin enlaces.</p>
        ) : (
          <div className="flex flex-col gap-2" ref={listRef}>
            {(data.links || []).map((l, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Texto" value={l.label} onChange={(v) => set(i, "label", v)} />
                  <Field label="URL o ancla" value={l.url} onChange={(v) => set(i, "url", v)} placeholder="#welcome" />
                </div>
                <DelBtn onClick={() => del(i)} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default FooterSection