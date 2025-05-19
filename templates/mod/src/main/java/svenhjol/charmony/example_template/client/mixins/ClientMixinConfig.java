package svenhjol.charmony.example_template.client.mixins;

import svenhjol.charmony.core.base.MixinConfig;
import svenhjol.charmony.core.enums.Side;
import svenhjol.charmony.example_template.ExampleTemplateMod;

public class ClientMixinConfig extends MixinConfig {
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
        return Side.Client;
    }
}
