package svenhjol.charmony.example_template.common.mixins;

import svenhjol.charmony.api.core.Side;
import svenhjol.charmony.core.base.MixinConfig;
import svenhjol.charmony.example_template.ExampleTemplateMod;

public class CommonMixinConfig extends MixinConfig {
    @Override
    protected String modId() {
        return ExampleTemplateMod.ID;
    }

    @Override
    protected String modRoot() {
        return "svenhjol.charmony.example_template";
    }

    @Override
    protected Side side() {
        return Side.Common;
    }
}
