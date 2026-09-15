# 🐾 homefurthem · 回家计划

**[homefurthem.org](https://homefurthem.org)** — bilingual (中文 / English) adoption website for rescued stray dogs, built for a volunteer rescue base in China.

为流浪动物救助基地做的领养网站：志愿者照顾着近百只从街头救回来的毛孩子，这个网站帮它们被更多人看见、早日回家。

## Features / 网站有什么

- 🐕 80+ adoptable dogs, each with a bilingual profile, photos and personality tags
- 🔍 Live search + filters: age / size / neuter status / personality
- 🏡 Adoption stories — the ones who made it home
- 🌐 One-tap 中文 / English switch
- 📱 Mobile-first, zero framework, zero build step — plain HTML / CSS / JS

## How it works / 运作方式

Volunteers keep day-to-day records in a shared knowledge base → profiles are synced into `data.js` (the single source of truth) → the fully-static site renders everything client-side. No backend, no database, hosting cost ≈ 0.

志愿者在协作文档里维护狗狗档案 → 同步进 `data.js` → 纯静态站点直接渲染。没有后端、没有数据库。

## Structure

```
index.html      # home / 首页
dogs.html       # adoptable dogs, search & filters / 待领养狗狗
stories.html    # adoption stories / 回家故事
adopt.html · foster.html · donate.html
app.js          # rendering, search, filters, i18n
data.js         # all content: dog profiles, stories, translations
styles.css
assets/         # photos
```

## Contributing / 参与

- 🎨 Art & illustrations welcome — hero art, decorations, anything that helps the dogs shine
- 🌍 Better translations welcome
- 🐾 Want to adopt or foster? Visit [homefurthem.org](https://homefurthem.org)

## License

Code is [MIT](LICENSE). **Dog photos and stories belong to the rescue volunteers and the dogs' families** — please don't reuse them outside this project.

代码 MIT 开源；狗狗的照片与故事属于志愿者和它们的家人，请勿挪作他用。
