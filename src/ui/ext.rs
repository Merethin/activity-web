pub const LAW_EXT: &'static str = r#"<label>Effect line (partial match): <input type="text" id="law-ext-line" class="ext-text"></label>"#;
pub const RSADOPT_EXT: &'static str = r#"<label>Resolution name (partial match): <input type="text" id="rsadopt-ext-name" class="ext-text"></label>"#;

pub const CHCLASS_EXT: &'static str = r#"<label>Starting classification (partial match): <input type="text" id="chclass-ext-orig" class="ext-text"></label>
<br><label> New classification (partial match): <input type="text" id="chclass-ext-new" class="ext-text"></label>"#;

pub const CHCENSUS_EXT: &'static str = r#"<label>Census type / percentage: <input type="text" id="chcensus-ext-type" class="ext-text"></label>"#;
pub const CHFIELD_EXT: &'static str = r#"<label>Field type / content: <input type="text" id="chfield-ext-type" class="ext-text"></label>"#;

pub const CHINF_EXT: &'static str = r#"<label>Direction: <select id="chinf-ext-direction" class="ext-select">
<option value="none" checked>Any</option>
<option value="rose">Influence increased</option>
<option value="fell">Influence decreased</option>
</select></label><br><label>Influence level: <input type="text" id="chinf-ext-level" class="ext-text"></label>"#;

pub const DISPATCH_EXT: &'static str = r#"<label>Name (partial match): <input type="text" id="dispatch-ext-name" class="ext-text"></label>
<br><label> Category: <input type="text" id="dispatch-ext-cat" class="ext-text"></label>
<br><label> Subcategory: <input type="text" id="dispatch-ext-subcat" class="ext-text"></label>"#;