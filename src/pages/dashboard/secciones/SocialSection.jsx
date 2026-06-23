import React from 'react'
import Card from '../components/Card';
import Field from '../components/Field';

const SocialSection = ({ data, onChange }) => {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  return (
    <div className="flex flex-col gap-4">
      {[
        { icon: "ti-brand-instagram", net: "Instagram",  keyName: "instagram",    keyUrl: "instagramUrl" },
        { icon: "ti-brand-facebook",  net: "Facebook",   keyName: "facebook",     keyUrl: "facebookUrl"  },
        { icon: "ti-brand-youtube",   net: "YouTube",    keyName: "youtube",      keyUrl: "youtubeUrl"   },
      ].map(({ icon, net, keyName, keyUrl }) => (
        <Card key={net} title={<span className="flex items-center gap-2"><i className={`ti ${icon}`} aria-hidden="true" /> {net}</span>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nombre / usuario" value={data[keyName]} onChange={s(keyName)} placeholder={`@${net.toLowerCase()}`} />
            <Field label="URL del perfil"   value={data[keyUrl]}  onChange={s(keyUrl)}  placeholder={`https://${net.toLowerCase()}.com/...`} />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default SocialSection